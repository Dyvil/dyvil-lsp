import {ConnectionService} from '../connection.service';
import {DocumentService} from '../document.service';
import {Config} from './config';

export const DEFAULT_SETTINGS: Config = {};

export class ConfigService {
  globalSettings: Config = DEFAULT_SETTINGS;
  documentConfigs: Map<string, Thenable<Config>> = new Map();

  constructor(
    private documentService: DocumentService,
    private connectionService: ConnectionService,
  ) {
    this.connectionService.connection.onInitialized(async () => {
      this.globalSettings = await this.connectionService.connection.workspace.getConfiguration('dyvil');
    });

    this.connectionService.connection.onDidChangeConfiguration(change => {
      const config = change.settings.fulibFeedback as Config;
      if (config) {
        this.globalSettings = config;
      }
      if (this.connectionService.hasConfigurationCapability) {
        this.documentConfigs.clear();
      }
    });

    this.documentService.documents.onDidClose(e => {
      this.documentConfigs.delete(e.document.uri);
    });
  }

  getDocumentConfig(resource: string): Thenable<Config> {
    if (!this.connectionService.hasConfigurationCapability) {
      return Promise.resolve(this.globalSettings);
    }
    let result = this.documentConfigs.get(resource);
    if (!result) {
      result = this.connectionService.connection.workspace.getConfiguration({
        scopeUri: resource,
        section: 'dyvil',
      });
      this.documentConfigs.set(resource, result);
    }
    return result;
  }
}
