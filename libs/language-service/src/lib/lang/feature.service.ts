import {Node, Position} from '@stc/compiler';
import {
  CompletionItem,
  CompletionParams,
  DeclarationParams,
  DocumentHighlight,
  DocumentHighlightParams,
  Hover,
  HoverParams,
  Location,
  PrepareRenameParams,
  Range as LspRange,
  ReferenceParams,
  RenameParams,
  TextDocumentPositionParams,
  WorkspaceEdit,
} from 'vscode-languageserver';
import {ConnectionService} from '../connection.service';
import {DocumentService} from '../document.service';
import {convertRange} from './validation.service';

export class FeatureService {
  constructor(
    private connectionService: ConnectionService,
    private documentService: DocumentService,
  ) {
    this.connectionService.connection.onPrepareRename(params => this.prepareRename(params));
    this.connectionService.connection.onRenameRequest(params => this.rename(params));

    this.connectionService.connection.onReferences(params => this.references(params));
    this.connectionService.connection.onDefinition(params => this.definition(params));
    this.connectionService.connection.onHover(params => this.hover(params));
    this.connectionService.connection.onDocumentHighlight(params => this.highlight(params));
  }

  private prepareRename(params: PrepareRenameParams): LspRange | undefined {
    const node = this.findNode(params);
    if (!node) {
      return;
    }

    const references = node.references('rename');
    if (!references || !references.length) {
      return;
    }
    return convertRange(node.location!);
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
    const doc = this.findNode(params)?.documentation();
    if (!doc) {
      return null;
    }

    return {
      contents: {
        kind: 'markdown',
        value: doc,
      },
    };
  }

  private highlight(params: DocumentHighlightParams): DocumentHighlight[] | undefined {
    const references = this.findNode(params)?.references();
    if (!references || !references.length) {
      return undefined;
    }
    return references.map(r => ({
      range: convertRange(r),
    }));
  }

  private findNode(params: TextDocumentPositionParams): Node<any> | undefined {
    const uri = params.textDocument.uri;
    const position = new Position(params.position.line + 1, params.position.character);
    const unit = this.documentService.getAST(uri);
    if (!unit) {
      return;
    }

    const nodes = unit.findByPosition(position);
    if (!nodes) {
      return;
    }

    return nodes[nodes.length - 1];
  }
}
