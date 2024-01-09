import {readFileSync} from 'fs';
import {Name, Scope} from './scope';
import {compilationUnit} from './compiler';
import {log} from "./lint";
import {CompilationUnit, Concept, Node, SignatureBuilder} from "./ast";

const paths = process.argv.slice(2);
let units: CompilationUnit[] = [];

for (const path of paths) {
  const text = readFileSync(path, 'utf8');
  const unit = compilationUnit(text, {path});
  units.push(unit);
}

const topScope: Scope = {
  lookup<N extends Node<any>>(name: Name, concept: Concept<N>): N | undefined {
    for (const unit of units) {
      for (const cls of unit.classes) {
        if (cls.name === name && cls instanceof concept) {
          return cls;
        }
      }
    }
    return;
  },

  list(): Node<any>[] {
    return units.flatMap(u => u.classes);
  },
}

units = units.map(u => u.resolve(topScope));
for (const diagnostic of units.flatMap(u => u.diagnostics)) {
  log(diagnostic);
}

for (const unit of units) {
  const sigBuilder = new SignatureBuilder();
  unit.buildSignature(sigBuilder);
  console.log(sigBuilder.signature, sigBuilder.hash);
}
