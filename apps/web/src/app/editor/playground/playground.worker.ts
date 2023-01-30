/// <reference lib="webworker" />

import {compilationUnit, SimpleScope} from '@stc/compiler';

declare const self: DedicatedWorkerGlobalScope;

console.log('Running Dyvil Compiler Server in Web Worker');

self.addEventListener('message', msg => {
  const compile = msg.data.compile;
  if (compile) {
    const compiled = compilationUnit(compile).resolve(new SimpleScope([])).toString('js');
    self.postMessage({compiled});
  }
});
