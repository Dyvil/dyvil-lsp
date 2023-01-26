import {Injectable} from '@nestjs/common';
import {compilationUnit, Node, Position, SimpleScope} from '@software-tools/compiler';
import {DeclarationParams, HoverParams, Location, TextDocumentPositionParams} from 'vscode-languageclient';
import {
  CompletionItem,
  CompletionParams,
  Hover,
  ReferenceParams,
  RenameParams,
  WorkspaceEdit,
} from 'vscode-languageserver';
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
    this.connectionService.connection.onHover(params => this.hover(params));
  }

  private rename(params: RenameParams): WorkspaceEdit | undefined {
    const references = this.findNode(params)?.references('rename');
    if (!references || !references.length) {
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
    const references = this.findNode(params)?.references('definition');
    if (!references || !references.length) {
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
    const references = this.findNode(params)?.references('definition');
    if (!references || !references.length) {
      return;
    }
    return {
      uri: params.textDocument.uri,
      range: convertRange(references[0]),
    };
  }

  private hover(params: HoverParams): Hover | null {
    const definition = this.findNode(params)?.definition?.();
    if (!definition) {
      return null;
    }
    return {
      range: convertRange(definition.location!),
      contents: {
        language: 'dyvil',
        value: definition.toString(),
      },
    };
  }

  private findNode(params: TextDocumentPositionParams): Node<any> | undefined {
    const uri = params.textDocument.uri;
    const position = new Position(params.position.line + 1, params.position.character);
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return;
    }

    const unit = compilationUnit(document.getText(), uri).resolve(new SimpleScope([]));
    const nodes = unit.findByPosition(position);
    if (!nodes) {
      return;
    }

    return nodes[nodes.length - 1];
  }
}
