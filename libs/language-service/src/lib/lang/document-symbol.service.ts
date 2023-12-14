import {ConnectionService} from "../connection.service";
import {DocumentSymbol, DocumentSymbolParams, SymbolKind} from "vscode-languageserver-protocol";
import {children, Declaration, Node} from "@stc/compiler";
import {DocumentService} from "../document.service";
import {convertRange} from "./validation.service";

const SYMBOL_KINDS: Record<string, SymbolKind> = {
  class: SymbolKind.Class,
  field: SymbolKind.Field,
  constructor: SymbolKind.Constructor,
  method: SymbolKind.Method,
  parameter: SymbolKind.Variable,
  variable: SymbolKind.Variable,
};

export class DocumentSymbolService {
  constructor(
    connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    connectionService.connection.onDocumentSymbol(params => this.provideSymbols(params));
  }

  private provideSymbols(params: DocumentSymbolParams): DocumentSymbol[] {
    const unit = this.documentService.getAST(params.textDocument.uri);
    if (!unit) {
      return [];
    }

    return this.toSymbols(unit);
  }

  private toSymbols(node: Node<string>): DocumentSymbol[] {
    const childSymbols = Array.from(children(node)).flatMap(child => this.toSymbols(child));
    if (!(node instanceof Declaration)) {
      return childSymbols;
    }

    return [{
      name: node.name,
      kind: SYMBOL_KINDS[node.kind],
      range: convertRange(node.range!),
      selectionRange: convertRange(node.location!),
      children: childSymbols,
    }];
  }
}

