import {Injectable} from '@nestjs/common';
import {compilationUnit, Position, SimpleScope} from '@software-tools/compiler';
import {CompletionItem, CompletionParams, RenameParams, WorkspaceEdit} from 'vscode-languageserver';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';
import {convertRange} from '../validation/validation.service';

@Injectable()
export class RenameService {
  constructor(
    private connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    this.connectionService.connection.onRenameRequest(params => {
      return this.rename(params);
    });
  }

  private rename(params: RenameParams): WorkspaceEdit | undefined {
    const uri = params.textDocument.uri;
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return undefined;
    }

    const position = new Position(params.position.line + 1, params.position.character);
    const unit = compilationUnit(document.getText(), uri).resolve(new SimpleScope([]));
    const nodes = unit.findByPosition(position);
    if (!nodes) {
      return undefined;
    }

    const target = nodes[nodes.length - 1];
    if (!target.references) {
      return undefined;
    }

    const references = target.references();
    return {
      changes: {
        [uri]: references.map(reference => ({
          range: convertRange(reference),
          newText: params.newName,
        })),
      },
    };
  }
}
