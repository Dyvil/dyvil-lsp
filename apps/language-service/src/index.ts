import {Connection} from 'vscode-languageserver';
import {ConnectionService} from './connection.service';
import {DocumentService} from './document.service';
import {CompletionService} from './lang/completion.service';
import {FeatureService} from './lang/feature.service';
import {ValidationService} from './lang/validation.service';

export function setup(connection: Connection) {
  const connectionService = new ConnectionService(connection);
  const documentService = new DocumentService(connectionService);
  new CompletionService(connectionService, documentService);
  new ValidationService(connectionService, documentService);
  new FeatureService(connectionService, documentService);
}
