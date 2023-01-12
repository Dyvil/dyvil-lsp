import {CharStreams, CommonTokenStream} from 'antlr4ts';
import {ParseTreeWalker} from 'antlr4ts/tree';
import {DyvilLexer} from './parser/DyvilLexer';
import {DyvilListener} from './parser/DyvilListener';
import {ClassContext, DyvilParser, MethodContext} from './parser/DyvilParser';

const text = `
class Main {
  func main(args: string) {
  }
}
`;
const inputStream = CharStreams.fromString(text);
const lexer = new DyvilLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new DyvilParser(tokenStream);
const file = parser.file();

class DyvilVisitorImpl implements DyvilListener {
  enterClass(ctx: ClassContext) {
    console.log('class', ctx._name.text);
  }

  enterMethod(ctx: MethodContext) {
    console.log('func', ctx._name.text, '(', ...ctx._parameters.map(p => p.text), ')');
  }
}

ParseTreeWalker.DEFAULT.walk<DyvilListener>(new DyvilVisitorImpl(), file);
