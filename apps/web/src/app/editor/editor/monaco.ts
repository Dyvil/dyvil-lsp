import {buildWorkerDefinition} from 'monaco-editor-workers';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import {MonacoLanguageClient} from 'monaco-languageclient';
import {StandaloneServices} from 'vscode/services';
import {CloseAction, ErrorAction, MessageTransports} from "vscode-languageclient";

StandaloneServices.initialize({});

buildWorkerDefinition('./assets/monaco-editor-workers/workers', document.baseURI, false);

monaco.languages.register({
  id: 'dyvil',
  aliases: ['Dyvil'],
  extensions: ['.dyv'],
});

monaco.languages.setMonarchTokensProvider('dyvil', {
  keywords: 'class|var|init|func|true|false|this|super'.split('|'),
  typeKeywords: [
    'boolean', 'int', 'void', 'string',
  ],
  operators: /[+\-*/%&|<>!:^=]+/,
  escapes: /\\./,
  tokenizer: {
    root: [
      [/[a-z][A-Za-z0-9_]*/, {
        cases: {
          '@typeKeywords': 'keyword',
          '@keywords': 'keyword',
          '@default': 'identifier',
        },
      }],
      [/[A-Z][A-Za-z0-9_]*/, 'type.identifier'],
      {include: '@whitespace'},
      [/[{}()\[\]]/, '@brackets'],
      [/@operators/, 'operator'],
      [/[+-]?\d+\.\d+/, 'number.float'],
      [/[+-]?\d+/, 'number'],
      [/[;,.]/, 'delimiter'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, {token: 'string.quote', bracket: '@open', next: '@string'}],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ['\\*/', 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, {token: 'string.quote', bracket: '@close', next: '@pop'}],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
  },
});

export function createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
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

