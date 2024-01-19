import {ConnectionService} from "../connection.service";
import {DocumentFormattingParams, DocumentRangeFormattingParams, TextEdit} from "vscode-languageserver-protocol";
import {Node} from "@stc/compiler";
import {DocumentService} from "../document.service";

import {convertRangeFromLsp, convertRangeToLsp} from "./convert";

export class FormatService {
  constructor(
    connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    connectionService.connection.onDocumentFormatting(params => this.handleFormatting(params));
    connectionService.connection.onDocumentRangeFormatting(params => this.handleRangeFormatting(params));
  }

  private async handleFormatting(params: DocumentFormattingParams): Promise<TextEdit[]> {
    const ast = await this.documentService.getAST(params.textDocument.uri);
    if (!ast) {
      return [];
    }

    return this.provideEdits(ast);
  }

  private async handleRangeFormatting(params: DocumentRangeFormattingParams): Promise<TextEdit[]> {
    const ast = await this.documentService.getAST(params.textDocument.uri);
    const node = ast?.findEnclosing(convertRangeFromLsp(params.range));
    if (!node) {
      return [];
    }

    return this.provideEdits(node);
  }

  private provideEdits(root: Node<string>): TextEdit[] {
    const edits: TextEdit[] = [];
    for (const node of [root]) {
      if (!node.range) {
        continue;
      }
      edits.push({
        range: convertRangeToLsp(node.range),
        newText: node.toString(),
      });
    }
    return edits;
  }
}

