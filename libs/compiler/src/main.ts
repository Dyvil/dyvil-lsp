import {readFileSync} from 'fs';
import {GlobalScope} from './scope';
import {compilationUnit} from './compiler';
import {log} from "./lint";
import {CompilationUnit, SignatureBuilder} from "./ast";

const paths = process.argv.slice(2);
let units: CompilationUnit[] = [];

for (const path of paths) {
  const text = readFileSync(path, 'utf8');
  const unit = compilationUnit(text, {path});
  units.push(unit);
}

const topScope = new GlobalScope(() => units);

units = units.map(u => u.resolve(topScope));
for (const diagnostic of units.flatMap(u => u.diagnostics)) {
  log(diagnostic);
}

units.forEach(u => u.link());

for (const unit of units) {
  const sigBuilder = new SignatureBuilder();
  unit.buildSignature(sigBuilder);
  const signature = sigBuilder.build();
  console.log(signature.signature, signature.hash, signature.dependencies);
}
