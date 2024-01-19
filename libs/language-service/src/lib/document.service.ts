import {CompilationUnit, compilationUnit, GlobalScope, Signature, SignatureBuilder} from '@stc/compiler';
import {TextDocuments} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {ConnectionService} from './connection.service';
import * as fs from 'fs';
import {glob} from 'glob';
import {
  DidChangeWatchedFilesNotification,
  DidChangeWatchedFilesParams,
  FileChangeType,
  FileSystemWatcher,
  WorkspaceFolder,
} from 'vscode-languageserver-protocol';

class FileMetadata {
  uri: string;
  path?: string;
  signature?: Signature;
  ast?: CompilationUnit;
}

export class DocumentService {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  astCache = new Map<string, FileMetadata>();
  globalScope = new GlobalScope(() => {
    return [...this.astCache.values()].map(file => file.ast).filter(Boolean) as CompilationUnit[];
  });

  constructor(
    private connectionService: ConnectionService,
  ) {
    this.documents.listen(this.connectionService.connection);
    this.connectionService.connection.onInitialized(async () => {
      const workspaceFolders = await this.connectionService.connection.workspace.getWorkspaceFolders();
      if (!workspaceFolders) {
        return;
      }

      await this.connectionService.connection.client.register(DidChangeWatchedFilesNotification.type, {
        watchers: workspaceFolders.map((folder): FileSystemWatcher => ({
          globPattern: {
            baseUri: folder.uri,
            pattern: '**/*.dyv',
          },
        })),
      });
      await this.init(workspaceFolders);
    });
    this.documents.onDidChangeContent(e => this.change(e.document.uri));

    this.connectionService.connection.onDidChangeWatchedFiles(params => this.onChanges(params));
  }

  private getOrCreateFile(uri: string, path = this.parseFileUri(uri)) {
    let file = this.astCache.get(uri);
    if (!file) {
      file = {uri, path};
      this.astCache.set(uri, file);
    }
    return file;
  }

  private async init(workspaceFolders: WorkspaceFolder[]) {
    const progress = await this.connectionService.connection.window.createWorkDoneProgress();
    progress.begin('Loading Dyvil workspace...');

    // 1. collect all files
    progress.report('Collecting files...');
    const initialFiles: FileMetadata[] = [];
    for (let workspaceFolder of workspaceFolders ?? []) {
      const folder = this.parseFileUri(workspaceFolder.uri);
      if (folder) {
        for (const file of await glob(`${folder}/**/*.dyv`)) {
          initialFiles.push(this.getOrCreateFile(`file://${file}`, file));
        }
      }
    }

    // 2. parse all files
    for (let i = 0; i < initialFiles.length; i++) {
      const file = initialFiles[i];
      progress.report(i / initialFiles.length, `Reading ${file.uri}...`);

      const doc = await this.loadDocument(file.path!);
      file.ast = this.parse(doc);
    }

    // 3. resolve all against global scope
    for (let i = 0; i < initialFiles.length; i++) {
      const file = initialFiles[i];
      progress.report(i / initialFiles.length, `Resolving ${file.uri}...`);
      this.resolve(file.ast!);
    }

    progress.done();
  }

  parseFileUri(uri: string): string | undefined {
    const prefix = 'file://';
    return uri.startsWith(prefix) ? uri.slice(prefix.length) : undefined;
  }

  private resolve(unit: CompilationUnit) {
    unit.diagnostics = [];
    unit.resolve(this.globalScope);
    unit.link();
    unit.lint(this.globalScope);
  }

  private async loadDocument(file: string) {
    const uri = `file://${file}`;
    const text = await fs.promises.readFile(file, 'utf-8');
    return TextDocument.create(uri, 'dyvil', 0, text);
  }

  private parse(doc: TextDocument): CompilationUnit {
    return compilationUnit(doc.getText(), {
      path: doc.uri,
      comments: true,
    });
  }

  private async onChanges(params: DidChangeWatchedFilesParams) {
    for (let change of params.changes) {
      switch (change.type) {
        case FileChangeType.Changed:
        case FileChangeType.Created:
          await this.change(change.uri);
          break;
        case FileChangeType.Deleted:
          const file = this.astCache.get(change.uri);
          file?.ast?.unlink();
          this.updateDependends(change.uri);
          this.astCache.delete(change.uri);
          break;
      }
    }
  }

  private async change(uri: string) {
    let document = this.documents.get(uri);
    if (!document) {
      // this can happen if the file is not created externally (not by the client)
      // e.g. "touch file.dyv"
      const fileUri = this.parseFileUri(uri);
      if (!fileUri) {
        return;
      }
      document = await this.loadDocument(fileUri);
    }
    const newUnit = this.parse(document);
    this.update(newUnit);
  }

  private update(newUnit: CompilationUnit, seen = new Set<string>) {
    const path = newUnit.path;
    if (seen.has(path)) {
      return;
    }

    seen.add(path);

    const file = this.getOrCreateFile(path);
    const oldUnit = file?.ast;
    file.ast = newUnit;

    oldUnit?.unlink();
    this.resolve(newUnit);

    const oldSignature = file.signature;

    const newSigBuilder = new SignatureBuilder();
    newUnit.buildSignature(newSigBuilder);
    const newSignature = newSigBuilder.build();
    file.signature = newSignature;

    if (oldUnit && oldSignature && newSignature.hash !== oldSignature.hash) {
      console.log('signature changed', path, oldSignature.signature, newSignature.signature);
      this.updateDependends(path, seen);
    }
  }

  private updateDependends(path: string, seen = new Set<string>) {
    for (let dependent of this.dependends(path)) {
      this.update(dependent, seen);
    }
  }

  dependends(onPath: string): CompilationUnit[] {
    const result: CompilationUnit[] = [];
    for (const file of this.astCache.values()) {
      if (file.ast && file.signature?.dependencies.has(onPath)) {
        result.push(file.ast);
      }
    }
    return result;
  }

  async getAST(uriOrDoc: string | TextDocument): Promise<CompilationUnit | undefined> {
    const uri = typeof uriOrDoc === 'string' ? uriOrDoc : uriOrDoc.uri;
    return this.getOrCreateFile(uri).ast;
  }
}
