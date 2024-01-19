import {ConnectionService} from "../connection.service";
import {DocumentService} from "../document.service";
import {InlayHint, InlayHintKind, InlayHintParams} from "vscode-languageserver-protocol";
import {Expression, FunctionCall, MethodCall, Parameter, recurse, Variable} from "@stc/compiler";
import {convertPositionToLsp, convertRangeFromLsp, convertRangeToLsp} from "./convert";

export class InlayHintService {
  constructor(
    connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    connectionService.connection.languages.inlayHint.on(params => this.provideInlayHints(params));
  }

  private async provideInlayHints(params: InlayHintParams): Promise<InlayHint[]> {
    const unit = await this.documentService.getAST(params.textDocument.uri);
    const enclosing = unit?.findEnclosing(convertRangeFromLsp(params.range));
    if (!enclosing) {
      return [];
    }

    const result: InlayHint[] = [];
    for (const node of recurse(enclosing)) {
      switch (node.kind) {
        case 'variable': {
          const variable = node as Variable;
          if (!variable.type || variable.type.location) {
            continue;
          }
          const text = `: ${variable.type}`;
          result.push({
            kind: InlayHintKind.Type,
            position: convertPositionToLsp(variable.location!.end),
            label: text,
            paddingLeft: true,
            textEdits: [{
              range: convertRangeToLsp(variable.location!),
              newText: variable.name + text,
            }],
          });
          break;
        }
        case 'expr:functionCall': {
          const call = node as FunctionCall;
          if (!call._constructor) {
            continue;
          }
          this.addParamHints(call.args, call._constructor.parameters, result);
          break;
        }
        case 'expr:methodCall': {
          const call = node as MethodCall;
          if (!call._method) {
            continue;
          }
          this.addParamHints(call.args, call._method.parameters, result);
          break;
        }
      }
    }
    return result;
  }

  private addParamHints(args: Expression[], params: Parameter[], result: InlayHint[]) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const param = params[i];
      if (!param || !arg.range) {
        continue;
      }
      const text = `${param.name}:`;
      const doc = param.documentation();
      result.push({
        kind: InlayHintKind.Parameter,
        position: convertPositionToLsp(arg.range.start),
        label: text,
        tooltip: doc && {
          kind: 'markdown',
          value: doc,
        },
        paddingRight: true,
      });
    }
  }
}
