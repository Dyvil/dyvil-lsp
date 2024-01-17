import {ConnectionService} from "../connection.service";
import {DocumentService} from "../document.service";
import {CodeAction, CodeActionKind, CodeActionParams} from "vscode-languageserver-protocol";
import {convertRangeFromLsp, convertRangeToLsp} from "./convert";
import {Node, Variable} from "@stc/compiler";

export class ActionService {
  constructor(
    connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    connectionService.connection.onCodeAction(params => this.provideActions(params));
  }

  private provideActions(params: CodeActionParams): CodeAction[] {
    const unit = this.documentService.getAST(params.textDocument.uri);
    if (!unit) {
      return [];
    }
    const actions: CodeAction[] = [];
    for (const diagnostic of params.context.diagnostics) {
      const replacement = diagnostic.data.replacement;
      if (replacement) {
        actions.push({
          title: `Replace with \`${replacement}\``,
          kind: 'quickfix',
          diagnostics: [diagnostic],
          isPreferred: true,
          edit: {
            changes: {
              [params.textDocument.uri]: [
                {
                  range: diagnostic.range,
                  newText: replacement,
                },
              ],
            },
          },
        });
      }
    }
    const node = unit.findEnclosing(convertRangeFromLsp(params.range));
    if (node) {
      const actionsForNode = this.provideActionsForNode(params.textDocument.uri, node);
      actions.push(...actionsForNode);
    }
    return actions;
  }

  private provideActionsForNode(uri: string, node: Node<string>): CodeAction[] {
    switch (node.kind) {
      case 'variable': {
        const variable = node as Variable;
        if (!variable.type || variable.type.location) {
          return [];
        }
        return [{
          title: `Specify type '${variable.type}' explicitly`,
          kind: CodeActionKind.RefactorRewrite,
          edit: {
            changes: {
              [uri]: [
                {
                  range: convertRangeToLsp(variable.location!),
                  newText: `${variable.name}: ${variable.type}`,
                },
              ],
            },
          },
        }];
      }
      default:
        return [];
    }
  }
}
