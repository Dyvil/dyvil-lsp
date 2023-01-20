import {CharStreams, CommonTokenStream} from 'antlr4ts';
import {SimpleScope} from './ast';
import {DyvilLexer} from './parser/DyvilLexer';
import {DyvilParser} from './parser/DyvilParser';

const text = `
class Greeter {
  var name: string = "World"

  init(name: string) {
    this.name = name
  }

  func greet(): void {
    var greeting: string = "Hello, " + this.name + "!"
    println(greeting)
  }
}
`;
const inputStream = CharStreams.fromString(text);
const lexer = new DyvilLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new DyvilParser(tokenStream);
const file = parser.file();
let class1 = file.class().cn;
console.dir(class1, {depth: null});
const scope = new SimpleScope([class1]);
class1 = class1.resolve(scope);
console.dir(class1, {depth: null});
console.log(class1.toString());
console.log(class1.toString('js'));
