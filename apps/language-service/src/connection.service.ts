import {
  Connection,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
} from 'vscode-languageserver';

export class ConnectionService {
  hasConfigurationCapability!: boolean;
  hasWorkspaceFolderCapability!: boolean;
  hasDiagnosticRelatedInformationCapability!: boolean;

  constructor(
    public readonly connection: Connection,
  ) {
    connection.onInitialize((params: InitializeParams) => {
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
          completionProvider: {
            triggerCharacters: ['.'],
          },
          renameProvider: {
            prepareProvider: true,
          },
          referencesProvider: true,
          definitionProvider: true,
          hoverProvider: true,
          documentHighlightProvider: true,
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
    connection.onInitialized(() => {
      if (this.hasConfigurationCapability) {
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
      }
    });
  }
}
