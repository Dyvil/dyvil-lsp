import {Injectable} from '@nestjs/common';
import {CodeAction, CodeActionParams} from 'vscode-languageserver';
import {ConnectionService} from '../connection/connection.service';

@Injectable()
export class ActionService {
  constructor(
    private connectionService: ConnectionService,
  ) {
    this.connectionService.connection.onCodeAction((params) => this.provideActions(params));
  }

  private async provideActions(params: CodeActionParams): Promise<CodeAction[]> {
    return [];
  }
}
