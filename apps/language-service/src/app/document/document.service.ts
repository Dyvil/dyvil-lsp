import {Injectable} from '@nestjs/common';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {TextDocuments} from 'vscode-languageserver/node';
import {ConnectionService} from '../connection/connection.service';

@Injectable()
export class DocumentService {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  constructor(
    private connectionService: ConnectionService,
  ) {
    this.documents.listen(this.connectionService.connection);
  }
}
