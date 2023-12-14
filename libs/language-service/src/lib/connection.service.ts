import {
  Connection,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
} from 'vscode-languageserver';
import {TOKEN_MODIFIERS, TOKEN_TYPES} from "./lang/semantic-token.service";

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
          completionProvider: {
            triggerCharacters: ['.'],
          },
          renameProvider: {
            prepareProvider: true,
          },
          referencesProvider: true,
          definitionProvider: true,
          typeDefinitionProvider: true,
          hoverProvider: true,
          documentHighlightProvider: true,
          semanticTokensProvider: {
            legend: {
              tokenTypes: TOKEN_TYPES,
              tokenModifiers: TOKEN_MODIFIERS,
            },
            full: true,
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
    connection.onInitialized(() => {
      if (this.hasConfigurationCapability) {
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
      }
    });
  }
}
