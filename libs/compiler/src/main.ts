import {CharStreams, CommonTokenStream} from 'antlr4ts';
import {classNode} from './ast/cst2ast';
import {SimpleScope} from './ast/scope';
import {DyvilLexer} from './parser/DyvilLexer';
import {DyvilParser} from './parser/DyvilParser';

const text = `
class Main {
  var x: int

  init() {
  }

  func new(): Main {
  }

  func main(args: string): void {
  }
}
`;
const inputStream = CharStreams.fromString(text);
const lexer = new DyvilLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new DyvilParser(tokenStream);
const file = parser.file();
let class1 = classNode(file.class());
console.dir(class1, {depth: null});
const scope = new SimpleScope([class1]);
class1 = class1.resolve(scope);
console.dir(class1, {depth: null});
console.log(class1.toString());
console.log(class1.toString('js'));
