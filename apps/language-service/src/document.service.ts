import {CompilationUnit, compilationUnit, SimpleScope} from '@stc/compiler';
import {TextDocuments} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {ConnectionService} from './connection.service';

export class DocumentService {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  astCache = new Map<string, CompilationUnit>();

  constructor(
    private connectionService: ConnectionService,
  ) {
    this.documents.listen(this.connectionService.connection);

    this.documents.onDidChangeContent(e => {
      if (this.astCache.has(e.document.uri)) {
        this.astCache.delete(e.document.uri);
      }
    });
  }

  getAST(uriOrDoc: string | TextDocument): CompilationUnit | undefined {
    const uri = typeof uriOrDoc === 'string' ? uriOrDoc : uriOrDoc.uri;
    const cached = this.astCache.get(uri);
    if (cached) {
      return cached;
    }
    const document = typeof uriOrDoc === 'string' ? this.documents.get(uri) : uriOrDoc;
    if (!document) {
      return;
    }
    return compilationUnit(document.getText(), uri).resolve(new SimpleScope([]));
  }
}
