import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {editor} from 'monaco-editor/esm/vs/editor/editor.api';
import {MonacoLanguageClient} from 'monaco-languageclient';
import {BrowserMessageReader, BrowserMessageWriter} from 'vscode-languageserver-protocol/browser';
import {MonacoBinding} from 'y-monaco';
import {WebsocketProvider} from 'y-websocket';
import {Doc as YDoc} from 'yjs';

import {environment} from '../../../environments/environment';
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

  private activatedRoute = inject(ActivatedRoute);

  worker?: Worker;
  editor?: editor.IStandaloneCodeEditor;
  lspClient?: MonacoLanguageClient;
  yjsBinding?: MonacoBinding;
  yjsDoc?: YDoc;
  websocketProvider?: WebsocketProvider;

  async ngAfterViewInit() {
    await ready;

    const domElement = this.container.nativeElement;
    this.editor = editor.create(domElement, {
      value: '', // will be set by yjs in order: server -> local storage -> default code
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

      this.worker = new Worker(new URL('./editor.worker.ts', import.meta.url));
      const reader = new BrowserMessageReader(this.worker);
      const writer = new BrowserMessageWriter(this.worker);
      this.lspClient = createLanguageClient({reader, writer});
      this.lspClient.start();
      reader.onClose(() => this.lspClient?.stop());

      const room = this.activatedRoute.snapshot.queryParamMap.get('room');
      if (room) {
        // Use Yjs collaborative editing
        this.initYjs(room);
      } else {
        // No room specified, use default code
        this.editor.setValue(this.code);
      }
    }

    this.ready.next();
  }

  private initYjs(room: string) {
    // connect to the room and get the doc
    this.yjsDoc = new YDoc();
    this.websocketProvider = new WebsocketProvider(
      environment.yjsWebsocketUrl,
      room,
      this.yjsDoc
    );
    const text = this.yjsDoc.getText('monaco');

    // Bind Yjs text to Monaco model, will overwrite model content
    this.yjsBinding = new MonacoBinding(
      text,
      // editor model is non-null as editor is created before
      this.editor!.getModel()!,
      new Set([this.editor!]),
      this.websocketProvider.awareness
    );

    // Will be fired only once, when sync is done
    this.websocketProvider.on('sync', (isSynced) => {
      // If Yjs document is empty, insert demo code
      if (isSynced && text.toString().length === 0) {
        this.yjsDoc?.transact(() => {
          text.insert(0, this.code);
        });
      }
    });
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
    this.yjsBinding?.destroy();
    this.yjsDoc?.destroy();
    this.websocketProvider?.destroy();
  }
}
