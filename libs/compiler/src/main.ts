import {readFileSync} from 'fs';
import {SimpleScope} from './scope';
import {compilationUnit} from './compiler';
import {log} from "./lint";

const path = process.argv[2] || 'examples/Greeter.dyv';

const text = readFileSync(path, 'utf8');
let file = compilationUnit(text, path);
file = file.resolve(new SimpleScope([]));
for (const diagnostic of file.diagnostics) {
  log(diagnostic);
}
console.log(file.toString('js'));
