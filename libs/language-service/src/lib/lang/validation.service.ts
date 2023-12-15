import {Diagnostic} from '@stc/compiler';
import {DiagnosticSeverity} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Diagnostic as LspDiagnostic} from 'vscode-languageserver/node';
import {ConnectionService} from '../connection.service';
import {DocumentService} from '../document.service';
import {convertRangeToLsp} from "./convert";

function convertDiagnostic({severity, location, message}: Diagnostic): LspDiagnostic {
  return {
    severity: severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
    range: convertRangeToLsp(location),
    message,
    source: 'dyvil',
  };
}

export class ValidationService {
  constructor(
    private connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    this.connectionService.connection.onDidChangeConfiguration(() => {
      this.documentService.documents.all().forEach(d => this.validateTextDocument(d));
    });
    this.documentService.documents.onDidChangeContent(change => {
      this.validateTextDocument(change.document);
    });
  }

  async validateTextDocument(textDocument: TextDocument): Promise<void> {
    const unit = this.documentService.getAST(textDocument);
    if (!unit) {
      return;
    }
    const diagnostics = unit.diagnostics.map(convertDiagnostic);
    await this.connectionService.connection.sendDiagnostics({uri: textDocument.uri, diagnostics});
  }
}
