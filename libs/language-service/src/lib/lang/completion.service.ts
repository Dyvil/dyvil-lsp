import {compilationUnit, SimpleScope} from '@stc/compiler';
import {CompletionItem, CompletionItemKind, CompletionParams, InsertTextFormat} from 'vscode-languageserver';
import {ConnectionService} from '../connection.service';
import {DocumentService} from '../document.service';

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
    const unit = compilationUnit(`${before}§${after}`, {completion: true}).resolve(new SimpleScope([]));
    const diagnostic = unit.diagnostics.find(d => d.expected);
    if (!diagnostic || !diagnostic.expected) {
      return [];
    }

    return diagnostic.expected.map((item): CompletionItem => ({
      kind: convertCompletionKind(item.kind),
      label: item.label,
      labelDetails: {detail: item.signature, description: item.description},
      insertText: item.snippet,
      insertTextFormat: item.snippet ? InsertTextFormat.Snippet : undefined,
    }));
  }
}
