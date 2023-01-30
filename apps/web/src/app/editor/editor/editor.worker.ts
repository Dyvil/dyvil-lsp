/// <reference lib="webworker" />

import {setup} from '@stc/language-service';
import {BrowserMessageReader, BrowserMessageWriter, createConnection} from 'vscode-languageserver/browser';

declare const self: DedicatedWorkerGlobalScope;

console.log('Running Dyvil Language Server in Web Worker');

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);
setup(connection);
connection.listen();
