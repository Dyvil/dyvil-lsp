import {Injectable} from '@nestjs/common';
import {compilationUnit, Position, Range, SimpleScope} from '@software-tools/compiler';
import {DeclarationParams, Location, TextDocumentPositionParams} from 'vscode-languageclient';
import {CompletionItem, CompletionParams, ReferenceParams, RenameParams, WorkspaceEdit} from 'vscode-languageserver';
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

    this.connectionService.connection.onReferences(params => this.references(params));
    this.connectionService.connection.onDefinition(params => this.definition(params));
  }

  private rename(params: RenameParams): WorkspaceEdit | undefined {
    const references = this.findReferences(params, 'rename');
    if (!references.length) {
      return;
    }
    return {
      changes: {
        [params.textDocument.uri]: references.map(reference => ({
          range: convertRange(reference),
          newText: params.newName,
        })),
      },
    };
  }

  private references(params: ReferenceParams): Location[] | undefined {
    const references = this.findReferences(params, 'definition');
    if (!references.length) {
      return undefined;
    }
    if (!params.context.includeDeclaration && references.length) {
      references.shift();
    }
    return references.map(reference => ({
      uri: params.textDocument.uri,
      range: convertRange(reference),
    }));
  }

  private definition(params: DeclarationParams): Location | undefined {
    const references = this.findReferences(params, 'definition');
    if (!references.length) {
      return;
    }
    return {
      uri: params.textDocument.uri,
      range: convertRange(references[0]),
    };
  }

  private findReferences(params: TextDocumentPositionParams, purpose: 'rename' | 'definition'): Range[] {
    const uri = params.textDocument.uri;
    const position = new Position(params.position.line + 1, params.position.character);
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return [];
    }

    const unit = compilationUnit(document.getText(), uri).resolve(new SimpleScope([]));
    const nodes = unit.findByPosition(position);
    if (!nodes) {
      return [];
    }

    const target = nodes[nodes.length - 1];
    if (!target.references) {
      return [];
    }

    return target.references(purpose);
  }
}
