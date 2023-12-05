import {ConnectionService} from "../connection.service";
import {
  SemanticTokenModifiers,
  SemanticTokens,
  SemanticTokensParams,
  SemanticTokenTypes,
  uinteger
} from "vscode-languageserver-protocol";
import {compilationUnit, FunctionCall, Parameter, Range, recurse, SimpleScope, VariableReference} from "@stc/compiler";
import {DocumentService} from "../document.service";

export const TOKEN_TYPES = Object.values(SemanticTokenTypes);
export const TOKEN_MODIFIERS = Object.values(SemanticTokenModifiers);

export class SemanticTokenService {
  constructor(
    connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    connectionService.connection.languages.semanticTokens.on(params => this.provideSemanticTokens(params));
  }

  private provideSemanticTokens(params: SemanticTokensParams): SemanticTokens {
    const unit = this.documentService.getAST(params.textDocument.uri);
    if (!unit) {
      return {data: []};
    }

    const dataCollector = new TokenDataCollector();

    for (const node of recurse(unit)) {
      switch (node.kind) {
        case 'class':
          dataCollector.addNode(node.location!, SemanticTokenTypes.class);
          break;
        case 'field':
        case 'expr:propertyAccess':
          dataCollector.addNode(node.location!, SemanticTokenTypes.property);
          break;
        case 'method':
        case 'expr:methodCall':
        case 'expr:functionCall':
          if (node instanceof FunctionCall && node._constructor) {
            dataCollector.addNode(node.location!, SemanticTokenTypes.class);
          } else {
            dataCollector.addNode(node.location!, SemanticTokenTypes.method);
          }
          break;
        case 'parameter':
          dataCollector.addNode(node.location!, SemanticTokenTypes.parameter);
          break;
        case 'variable':
          dataCollector.addNode(node.location!, SemanticTokenTypes.variable);
          break;
        case 'expr:variable':
          if (node instanceof VariableReference && node._variable instanceof Parameter) {
            dataCollector.addNode(node.location!, SemanticTokenTypes.parameter);
          } else {
            dataCollector.addNode(node.location!, SemanticTokenTypes.variable);
          }
          break;
      }
    }

    return {data: dataCollector.data};
  }
}

class TokenDataCollector {
  data: uinteger[] = [];
  prevLine = 0;
  prevChar = 0;

  addNode(location: Range, tokenType: SemanticTokenTypes, modifiers: SemanticTokenModifiers[] = []) {
    // step 1: map token types and modifiers to numbers using legend
    const tokenTypeIndex = TOKEN_TYPES.indexOf(tokenType);
    const tokenModifiersBits = modifiers.map(modifier => TOKEN_MODIFIERS.indexOf(modifier)).reduce((a, b) => a | (1 << b), 0);
    // step 2: map line and start char to relative values
    const startLine = location.start.line - 1;
    const deltaLine = startLine - this.prevLine;
    const startChar = location.start.column - 1;
    const deltaChar = startChar - (startLine === this.prevLine ? this.prevChar : 0);
    // step 3: inline all the fields
    this.data.push(deltaLine, deltaChar, location.end.column - location.start.column, tokenTypeIndex, tokenModifiersBits);
    this.prevLine = startLine;
    this.prevChar = startChar;
  }
}
