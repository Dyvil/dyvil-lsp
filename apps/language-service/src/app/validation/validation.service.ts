import {Injectable} from '@nestjs/common';
import {DiagnosticSeverity} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Diagnostic as LspDiagnostic} from 'vscode-languageserver/node';
import {Diagnostic, SimpleScope} from '../../../../../libs/compiler/src/ast';
import {compilationUnit} from '../../../../../libs/compiler/src/compiler';
import {ConfigService} from '../config/config.service';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';

function convertDiagnostic({severity, location, message}: Diagnostic): LspDiagnostic {
  return {
    severity: severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
    range: {
      start: {line: location.start.line - 1, character: location.start.column},
      end: {line: location.end.line - 1, character: location.end.column},
    },
    message,
    source: 'dyvil',
  };
}

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

    let unit = compilationUnit(textDocument.getText());
    let diagnostics = unit.diagnostics.map(convertDiagnostic);
    await this.connectionService.connection.sendDiagnostics({uri, diagnostics});

    unit = unit.resolve(new SimpleScope([]));
    diagnostics = unit.diagnostics.map(convertDiagnostic);

    await this.connectionService.connection.sendDiagnostics({uri, diagnostics});
  }
}
