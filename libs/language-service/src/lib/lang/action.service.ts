import {ConnectionService} from "../connection.service";
import {DocumentService} from "../document.service";
import {CodeAction, CodeActionParams} from "vscode-languageserver-protocol";

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
    return actions;
  }
}
