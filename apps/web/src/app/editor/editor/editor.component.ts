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
import {buildWorkerDefinition} from 'monaco-editor-workers';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import {CloseAction, ErrorAction, MessageTransports, MonacoLanguageClient, MonacoServices} from 'monaco-languageclient';
import {BrowserMessageReader, BrowserMessageWriter} from 'vscode-languageserver-protocol/browser';
import getMessageServiceOverride from 'vscode/service-override/messages';
import {StandaloneServices} from 'vscode/services';
import {dyvilMonacoLang, dyvilMonarchLang} from '../../monaco';

StandaloneServices.initialize({
  ...getMessageServiceOverride(document.body),
});

buildWorkerDefinition('./assets/monaco-editor-workers/workers', window.location.href + '../..', false);

monaco.languages.register(dyvilMonacoLang);
monaco.languages.setMonarchTokensProvider('dyvil', dyvilMonarchLang);

function createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: 'Dyvil Language Client',
    clientOptions: {
      documentSelector: [{language: 'dyvil'}],
      errorHandler: {
        error: () => ({action: ErrorAction.Continue}),
        closed: () => ({action: CloseAction.DoNotRestart}),
      },
    },
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      },
    },
  });
}

@Component({
  selector: 'stc-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('container', {static: true}) container!: ElementRef;

  @Input() language = 'dyvil';

  @Input() code: string;
  @Output() codeChanged = new EventEmitter<string>();

  worker?: Worker;
  editor?: monaco.editor.IStandaloneCodeEditor;
  lspClient?: MonacoLanguageClient;

  async ngAfterViewInit() {
    const domElement = this.container.nativeElement;
    this.editor = monaco.editor.create(domElement, {
      value: this.code,
      language: this.language,
      theme: 'vs-dark',
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
      automaticLayout: true,
    });
    this.editor.onDidChangeModelContent(() => {
      this.editor && this.codeChanged.next(this.editor.getValue());
    });

    if (this.language === 'dyvil') {
      MonacoServices.install();

      this.worker = new Worker(new URL('./editor.worker.ts', import.meta.url));
      const reader = new BrowserMessageReader(this.worker);
      const writer = new BrowserMessageWriter(this.worker);
      this.lspClient = createLanguageClient({reader, writer});
      this.lspClient.start();
      reader.onClose(() => this.lspClient?.stop());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['code']) {
      this.editor?.setValue(changes['code'].currentValue);
    }
  }

  async ngOnDestroy() {
    this.editor?.dispose();
    await this.lspClient?.stop();
    this.worker?.terminate();
  }
}
