import {readFileSync} from 'fs';
import {log, SimpleScope} from './ast';
import {compilationUnit} from './compiler';

const text = readFileSync('examples/Greeter.dyv', 'utf8');
let file = compilationUnit(text);
file = file.resolve(new SimpleScope([]));
for (let diagnostic of file.diagnostics) {
  log(diagnostic);
}
console.log(file.toString('js'));
