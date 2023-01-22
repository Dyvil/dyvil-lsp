import {Injectable} from '@nestjs/common';
import {
  _Connection,
  createConnection,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';

@Injectable()
export class ConnectionService {
  connection!: _Connection;
  hasConfigurationCapability!: boolean;
  hasWorkspaceFolderCapability!: boolean;
  hasDiagnosticRelatedInformationCapability!: boolean;

  constructor() {
    this.connection = createConnection(ProposedFeatures.all);
    this.connection.onInitialize((params: InitializeParams) => {
      const capabilities = params.capabilities;

      this.hasConfigurationCapability = !!capabilities.workspace?.configuration;
      this.hasWorkspaceFolderCapability = !!capabilities.workspace?.workspaceFolders;
      this.hasDiagnosticRelatedInformationCapability = !!capabilities.textDocument?.publishDiagnostics?.relatedInformation;

      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Incremental,
          codeActionProvider: {
            resolveProvider: true,
          },
        },
      };
      if (this.hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
          workspaceFolders: {
            supported: true,
          },
        };
      }
      return result;
    });
    this.connection.onInitialized(() => {
      if (this.hasConfigurationCapability) {
        this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
      }
    });
  }
}
