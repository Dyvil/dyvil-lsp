import {CharStreams, CommonTokenStream} from 'antlr4ts';
import {SimpleScope} from './ast';
import {DyvilLexer} from './parser/DyvilLexer';
import {DyvilParser} from './parser/DyvilParser';

const text = `
class Greeter {
  var name: string = "World"
  var count: int = 0

  init(name: string) {
    this.name = name
  }

  func greet(): void {
    var greeting = "Hello, " + this.name + "!"
    println(greeting)
    var newCount = this.count + 1
    this.count = newCount
  }
}
`;
const inputStream = CharStreams.fromString(text, 'Greeter.dyv');
const lexer = new DyvilLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new DyvilParser(tokenStream);
let file = parser.file().cu;
file = file.resolve(new SimpleScope([]));
console.dir(file, {depth: null});
console.log(file.toString());
console.log(file.toString('js'));
