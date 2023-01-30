import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {buildWorkerDefinition} from 'monaco-editor-workers';

import 'monaco-editor/esm/vs/editor/editor.all.js';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';
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
export class EditorComponent implements AfterViewInit {
  @ViewChild('editor', {static: true}) editor!: ElementRef;

  async ngAfterViewInit() {
    const examplePath = '/assets/examples/Greeter.dyv';
    const code = await fetch(examplePath).then(r => r.text());

    const model = monaco.editor.createModel(code, 'dyvil');
    const domElement = this.editor.nativeElement;
    monaco.editor.create(domElement, {
      model: model,
      theme: 'vs-dark',
      glyphMargin: true,
      lightbulb: {
        enabled: true,
      },
      automaticLayout: true,
    });

    MonacoServices.install();

    const worker = new Worker(new URL('./editor.worker.ts', import.meta.url));
    const reader = new BrowserMessageReader(worker);
    const writer = new BrowserMessageWriter(worker);
    const languageClient = createLanguageClient({reader, writer});
    languageClient.start();

    reader.onClose(() => languageClient.stop());
  }
}
