import {Injectable} from '@nestjs/common';
import {CompletionItem, CompletionItemKind, CompletionParams} from 'vscode-languageserver';
import {SimpleScope} from '../../../../../libs/compiler/src/ast';
import {compilationUnit} from '../../../../../libs/compiler/src/compiler';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';

function convertCompletionKind(kind: string): CompletionItemKind {
  switch (kind) {
    case 'keyword':
      return CompletionItemKind.Keyword;
    case 'operator':
      return CompletionItemKind.Operator;
    case 'class':
      return CompletionItemKind.Class;
    case 'field':
      return CompletionItemKind.Field;
    case 'method':
      return CompletionItemKind.Method;
    case 'variable':
    case 'parameter':
      return CompletionItemKind.Variable;
    default:
      return CompletionItemKind.Text;
  }
}

@Injectable()
export class CompletionService {
  constructor(
    private connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    this.connectionService.connection.onCompletion(params => {
      return this.provideCompletionItems(params);
    });
  }

  private provideCompletionItems(params: CompletionParams): CompletionItem[] {
    const uri = params.textDocument.uri;
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return [];
    }

    const before = document.getText({
      start: {line: 0, character: 0},
      end: params.position,
    });
    const after = document.getText({
      start: params.position,
      end: {line: document.lineCount, character: 0},
    });
    const unit = compilationUnit(`${before}§${after}`).resolve(new SimpleScope([]));
    const diagnostic = unit.diagnostics.find(d => d.message.includes('input \'§\' expecting'));
    if (!diagnostic || !diagnostic.expected) {
      return [];
    }

    return diagnostic.expected.map((item) => ({
      kind: convertCompletionKind(item.kind),
      label: item.label,
      detail: item.detail,
    }));
  }
}
