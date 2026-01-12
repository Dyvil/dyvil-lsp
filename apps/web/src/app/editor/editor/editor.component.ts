import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import {editor} from 'monaco-editor/esm/vs/editor/editor.api';
import {MonacoLanguageClient} from 'monaco-languageclient';
import {BrowserMessageReader, BrowserMessageWriter,} from 'vscode-languageserver-protocol/browser';
import {MonacoBinding} from 'y-monaco';
import {WebsocketProvider} from 'y-websocket';

import * as Y from 'yjs';
import {environment} from '../../../environments/environment';
import {createLanguageClient, ready} from './monaco';

@Component({
  selector: 'stc-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  standalone: false,
})
export class EditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  @Input() language = 'dyvil';

  @Input() code: string;
  @Output() codeChanged = new EventEmitter<string>();
  @Output() ready = new EventEmitter<void>();

  worker?: Worker;
  editor?: editor.IStandaloneCodeEditor;
  lspClient?: MonacoLanguageClient;
  yesBinding?: MonacoBinding;

  async ngAfterViewInit() {
    await ready;

    const roomName = `monaco-demo-dyvil`; //TODO for studis: make configurable, i won't

    const domElement = this.container.nativeElement;
    this.editor = editor.create(domElement, {
      value: '', // will be set by yjs
      language: this.language,
      theme: 'vs-dark',
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
      automaticLayout: true,
      'semanticHighlighting.enabled': true,
    });
    this.editor.onDidChangeModelContent(() => {
      this.editor && this.codeChanged.next(this.editor.getValue());
    });

    if (this.language === 'dyvil') {
      const doc = new Y.Doc();
      const provider = new WebsocketProvider(
        // start local server via 'HOST=localhost PORT=8080 npx y-websocket'
        environment.yjsWebsocketUrl,
        roomName,
        doc,
      );
      const text = doc.getText('monaco');

      this.worker = new Worker(new URL('./editor.worker.ts', import.meta.url));
      const reader = new BrowserMessageReader(this.worker);
      const writer = new BrowserMessageWriter(this.worker);
      this.lspClient = createLanguageClient({ reader, writer });
      this.lspClient.start();
      reader.onClose(() => this.lspClient?.stop());

      // Bind Yjs text to Monaco model, will overwrite model content
      this.yesBinding = new MonacoBinding(
        text,
        this.editor.getModel()!,
        new Set([this.editor]),
        provider.awareness,
      );

      // Will be fired only once, when sync is done
      provider.on('sync', (isSynced) => {
        // If Yjs document is empty, insert demo code
        if (isSynced && text.toString().length === 0) {
          doc.transact(() => {
            text.insert(0, this.code);
          });
        }
      });
    }

    this.ready.next();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['code']) {
      this.editor?.setValue(changes['code'].currentValue);
    }
  }

  async compile(): Promise<string | undefined> {
    return this.lspClient?.sendRequest('$/compile', {
      uri: this.editor?.getModel()?.uri.toString(),
      format: 'js',
    });
  }

  async ngOnDestroy() {
    this.editor?.dispose();
    await this.lspClient?.stop();
    this.worker?.terminate();
    this.yesBinding?.destroy();
  }
}
