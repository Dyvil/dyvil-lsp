import {CompilationUnit, compilationUnit, GlobalScope, Signature, SignatureBuilder} from '@stc/compiler';
import {TextDocumentChangeEvent, TextDocuments} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {ConnectionService} from './connection.service';
import * as fs from 'fs';
import {glob} from 'glob';

export class DocumentService {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  signatures = new Map<string, Signature>();
  astCache = new Map<string, CompilationUnit>();
  globalScope = new GlobalScope(() => this.astCache.values());

  constructor(
    private connectionService: ConnectionService,
  ) {
    this.documents.listen(this.connectionService.connection);
    this.connectionService.connection.onInitialized(() => this.init());
  }

  private async init() {
    const progress = await this.connectionService.connection.window.createWorkDoneProgress();
    progress.begin('Loading Dyvil workspace...');
    const workspaceFolders = await this.connectionService.connection.workspace.getWorkspaceFolders();

    // 1. collect all files
    progress.report('Collecting files...');
    const files: string[] = [];
    for (let workspaceFolder of workspaceFolders ?? []) {
      const folder = parseFileUri(workspaceFolder.uri);
      if (folder) {
        files.push(...await glob(`${folder}/**/*.dyv`));
      }
    }

    // 2. parse all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      progress.report(i / files.length, `Reading ${file}...`);

      const uri = `file://${file}`;
      const text = await fs.promises.readFile(file, 'utf-8');
      const doc = TextDocument.create(uri, 'dyvil', 0, text);
      const unit = this.parse(doc);
      this.astCache.set(uri, unit);
    }

    // 3. resolve all against global scope
    let i = 0;
    for (const unit of this.astCache.values()) {
      progress.report(i / files.length, `Resolving ${unit.path}...`);
      unit.resolve(this.globalScope);
      unit.link();
      unit.lint(this.globalScope);
    }

    progress.done();
  }

  private parse(doc: TextDocument): CompilationUnit {
    return compilationUnit(doc.getText(), {
      path: doc.uri,
      comments: true,
    });
  }

  private change(e: TextDocumentChangeEvent<TextDocument>) {
    console.log('change', e.document.uri);
    const newUnit = this.parse(e.document);
    this.update(newUnit);
  }

  private update(newUnit: CompilationUnit, seen = new Set<string>) {
    const path = newUnit.path;
    if (seen.has(path)) {
      console.log('skip', path);
      return;
    }

    console.log('update', path);
    seen.add(path);

    const oldUnit = this.astCache.get(path);
    this.astCache.set(path, newUnit);

    oldUnit?.unlink();
    newUnit.diagnostics = [];
    newUnit.resolve(this.globalScope);
    newUnit.link();
    newUnit.lint(this.globalScope);

    const oldSignature = this.signatures.get(path);

    const newSigBuilder = new SignatureBuilder();
    newUnit.buildSignature(newSigBuilder);
    const newSignature = newSigBuilder.build();
    this.signatures.set(path, newSignature);

    if (oldUnit && oldSignature && newSignature.hash !== oldSignature.hash) {
      console.log('signature changed', path, oldSignature.signature, newSignature.signature);
      for (let dependent of this.dependends(path)) {
        this.update(dependent, seen);
      }
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

  getAST(uriOrDoc: string | TextDocument): CompilationUnit | undefined {
    const uri = typeof uriOrDoc === 'string' ? uriOrDoc : uriOrDoc.uri;
    return this.astCache.get(uri);
  }
}

function parseFileUri(uri: string): string | undefined {
  const prefix = 'file://';
  return uri.startsWith(prefix) ? uri.slice(prefix.length) : undefined;
}
