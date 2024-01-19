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

export class DocumentService {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  signatures = new Map<string, Signature>();
  astCache = new Map<string, CompilationUnit>();
  globalScope = new GlobalScope(() => this.astCache.values());

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

  private async init(workspaceFolders: WorkspaceFolder[]) {
    const progress = await this.connectionService.connection.window.createWorkDoneProgress();
    progress.begin('Loading Dyvil workspace...');

    // 1. collect all files
    progress.report('Collecting files...');
    const files: string[] = [];
    for (let workspaceFolder of workspaceFolders ?? []) {
      const folder = this.parseFileUri(workspaceFolder.uri);
      if (folder) {
        files.push(...await glob(`${folder}/**/*.dyv`));
      }
    }

    // 2. parse all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      progress.report(i / files.length, `Reading ${file}...`);

      const doc = await this.loadDocument(file);
      const unit = this.parse(doc);
      this.astCache.set(doc.uri, unit);
    }

    // 3. resolve all against global scope
    let i = 0;
    for (const unit of this.astCache.values()) {
      progress.report(i / files.length, `Resolving ${unit.path}...`);
      this.resolve(unit);
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
          const ast = this.astCache.get(change.uri);
          ast?.unlink();
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

    const oldUnit = this.astCache.get(path);
    this.astCache.set(path, newUnit);

    oldUnit?.unlink();
    this.resolve(newUnit);

    const oldSignature = this.signatures.get(path);

    const newSigBuilder = new SignatureBuilder();
    newUnit.buildSignature(newSigBuilder);
    const newSignature = newSigBuilder.build();
    this.signatures.set(path, newSignature);

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
    for (const [path, sig] of this.signatures) {
      if (sig.dependencies.has(onPath)) {
        const unit = this.astCache.get(path);
        if (unit) {
          result.push(unit);
        }
      }
    }
    return result;
  }

  async getAST(uriOrDoc: string | TextDocument): Promise<CompilationUnit | undefined> {
    const uri = typeof uriOrDoc === 'string' ? uriOrDoc : uriOrDoc.uri;
    return this.astCache.get(uri);
  }
}
