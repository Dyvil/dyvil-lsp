import {ANTLRErrorListener, CharStreams, CommonTokenStream, DiagnosticErrorListener, Recognizer, Token} from 'antlr4ts';
import {CompilationUnit, CompletionItem, Diagnostic, Position, Range} from './ast';
import {DyvilLexer} from './parser/DyvilLexer';
import {DyvilParser} from './parser/DyvilParser';

export function makeRange(start: Token, stop?: Token) {
  return new Range(
    new Position(start.line, start.charPositionInLine),
    stop ? new Position(stop.line, stop.charPositionInLine + (stop.text?.length || 0)) : new Position(start.line, start.charPositionInLine + (start.text?.length || 0))
  );
}

export function cleanDoc(doc: Token | undefined): string | undefined {
  return doc?.text?.replace(/^\/\*\*\n?|^\s*\*(?: |\/$)?/gm, '');
}

export function compilationUnit(source: string, path?: string): CompilationUnit {
  const inputStream = path ? CharStreams.fromString(source, path) : CharStreams.fromString(source);
  const lexer = new DyvilLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new DyvilParser(tokenStream);
  const diagnostics: Diagnostic[] = [];
  const errorListener: ANTLRErrorListener<Token> = {
    syntaxError: (recognizer, offendingSymbol, line, charPositionInLine, msg, e) => {
      if (!offendingSymbol) {
        return;
      }
      const expectedTokens = recognizer.state in recognizer.atn.states ? recognizer.atn.getExpectedTokens(recognizer.state, undefined).toArray() : [];
      const expectedText = expectedTokens
        .map(id => DyvilLexer.VOCABULARY.getLiteralName(id))
        .filter((s): s is string => !!s)
        .map((s): CompletionItem => ({
          kind: /^[a-z]+$/.test(s) ? 'keyword' : 'operator',
          label: s.slice(1, -1),
        }))
      ;
      diagnostics.push(new Diagnostic(path, makeRange(offendingSymbol as Token), msg, 'error', expectedText));
    }
  };
  lexer.removeErrorListeners();
  lexer.addErrorListener(errorListener);
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);
  const compilationUnit = parser.file().cu;
  compilationUnit.diagnostics = diagnostics;
  return compilationUnit;
}
