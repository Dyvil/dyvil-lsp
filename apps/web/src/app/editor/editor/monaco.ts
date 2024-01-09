import * as extensionManifest from 'apps/vs-code-client/package.json';

import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getExtensionsServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
import getLanguageServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import {whenReady} from '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-javascript-default-extension';

import {CloseAction, ErrorAction, MessageTransports} from "vscode-languageclient";
import {ExtensionHostKind, registerExtension} from 'vscode/extensions'
import {buildWorkerDefinition} from 'monaco-editor-workers';
import {initServices, MonacoLanguageClient, useOpenEditorStub} from 'monaco-languageclient';
import 'vscode/localExtensionHost';
import * as monaco from 'monaco-editor';

export const ready = initServices({
  userServices: {
    ...getExtensionsServiceOverride(),
    ...getThemeServiceOverride(),
    ...getTextmateServiceOverride(),
    ...getLanguageServiceOverride(),
    ...getEditorServiceOverride(useOpenEditorStub),
  },
}).then(() => {
  const extension = registerExtension(extensionManifest, ExtensionHostKind.LocalProcess);
  extension.registerFileUrl('./assets/dyvil.tmGrammar.json', new URL('apps/vs-code-client/assets/dyvil.tmGrammar.json', import.meta.url).href);
}).then(() => whenReady());

buildWorkerDefinition('./assets/monaco-editor-workers/workers', document.baseURI, false);

monaco.languages.register({
  id: 'dyvil',
  aliases: ['Dyvil'],
  extensions: ['.dyv'],
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

