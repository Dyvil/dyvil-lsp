import {CharStreams, CommonTokenStream} from 'antlr4ts';
import {CompilationUnit} from './ast';
import {DyvilLexer} from './parser/DyvilLexer';
import {DyvilParser} from './parser/DyvilParser';

export function compilationUnit(source: string): CompilationUnit {
  const inputStream = CharStreams.fromString(source, 'Greeter.dyv');
  const lexer = new DyvilLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new DyvilParser(tokenStream);
  return parser.file().cu;
}
