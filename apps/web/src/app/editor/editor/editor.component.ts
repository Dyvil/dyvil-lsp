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
import {BrowserMessageReader, BrowserMessageWriter} from 'vscode-languageserver-protocol/browser';
import {createLanguageClient, ready} from './monaco';

@Component({
  selector: 'stc-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  standalone: false,
})
export class EditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('container', {static: true}) container!: ElementRef;

  @Input() language = 'dyvil';

  @Input() code: string;
  @Output() codeChanged = new EventEmitter<string>();
  @Output() ready = new EventEmitter<void>();

  worker?: Worker;
  editor?: editor.IStandaloneCodeEditor;
  lspClient?: MonacoLanguageClient;

  async ngAfterViewInit() {
    await ready;

    const domElement = this.container.nativeElement;
    this.editor = editor.create(domElement, {
      value: this.code,
      language: this.language,
      theme: 'vs-dark',
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
      automaticLayout: true,
      "semanticHighlighting.enabled": true,
    });
    this.editor.onDidChangeModelContent(() => {
      this.editor && this.codeChanged.next(this.editor.getValue());
    });

    if (this.language === 'dyvil') {

      this.worker = new Worker(new URL('./editor.worker.ts', import.meta.url));
      const reader = new BrowserMessageReader(this.worker);
      const writer = new BrowserMessageWriter(this.worker);
      this.lspClient = createLanguageClient({reader, writer});
      this.lspClient.start();
      reader.onClose(() => this.lspClient?.stop());
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
  }
}
