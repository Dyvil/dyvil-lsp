import {readFileSync} from 'fs';
import {SimpleScope} from './ast';
import {compilationUnit} from './compiler';

const text = readFileSync('examples/Greeter.dyv', 'utf8');
let file = compilationUnit(text);
file = file.resolve(new SimpleScope([]));
console.log(file.toString('js'));
