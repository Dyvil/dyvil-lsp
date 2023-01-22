import {Injectable} from '@nestjs/common';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Diagnostic} from 'vscode-languageserver/node';
import {ConfigService} from '../config/config.service';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';

@Injectable()
export class ValidationService {
  private openDocuments: TextDocument[] = [];

  constructor(
    private connectionService: ConnectionService,
    private documentService: DocumentService,
    private configService: ConfigService,
  ) {
    this.connectionService.connection.onDidChangeConfiguration(() => {
      this.documentService.documents.all().forEach(d => this.validateTextDocument(d));
    });
    this.documentService.documents.onDidChangeContent(change => {
      this.validateTextDocument(change.document);
    });

    this.documentService.documents.onDidOpen(async event => {
      this.openDocuments.push(event.document);
    });
    this.documentService.documents.onDidClose(async event => {
      const index = this.openDocuments.findIndex(t => t.uri === event.document.uri);
      if (index >= 0) {
        this.openDocuments.splice(index, 1);
      }

      if (this.openDocuments.length !== 0) {
        return;
      }
    });
  }

  async validateTextDocument(textDocument: TextDocument): Promise<void> {
    const uri = textDocument.uri;
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return;
    }

    const diagnostics: Diagnostic[] = [];
    // TODO

    this.connectionService.connection.sendDiagnostics({uri, diagnostics});
  }
}
