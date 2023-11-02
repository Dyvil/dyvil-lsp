import {readFileSync} from 'fs';
import {log, SimpleScope} from './ast';
import {compilationUnit} from './compiler';

const path = process.argv[2];

const text = readFileSync(path, 'utf8');
let file = compilationUnit(text, path);
file = file.resolve(new SimpleScope([]));
for (const diagnostic of file.diagnostics) {
  log(diagnostic);
}
console.log(file.toString('js'));
