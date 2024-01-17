import {Connection} from 'vscode-languageserver';
import {ConnectionService} from './lib/connection.service';
import {DocumentService} from './lib/document.service';
import {CompletionService} from './lib/lang/completion.service';
import {FeatureService} from './lib/lang/feature.service';
import {ValidationService} from './lib/lang/validation.service';
import {SemanticTokenService} from "./lib/lang/semantic-token.service";
import {DocumentSymbolService} from "./lib/lang/document-symbol.service";
import {FormatService} from "./lib/lang/format.service";
import {ActionService} from "./lib/lang/action.service";
import {InlayHintService} from "./lib/lang/inlay-hint.service";

export function setup(connection: Connection) {
  const connectionService = new ConnectionService(connection);
  const documentService = new DocumentService(connectionService);
  new CompletionService(connectionService, documentService);
  new ValidationService(connectionService, documentService);
  new FeatureService(connectionService, documentService);
  new SemanticTokenService(connectionService, documentService);
  new DocumentSymbolService(connectionService, documentService);
  new FormatService(connectionService, documentService);
  new ActionService(connectionService, documentService);
  new InlayHintService(connectionService, documentService);

  connection.onRequest('$/compile', params => {
    const ast = documentService.getAST(params.uri);
    return ast?.toString(params.format);
  });
}
