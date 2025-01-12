import {ANTLRErrorListener, CharStreams, CommonTokenStream, Token} from 'antlr4ts';
import {CompilationUnit, Node, recurse} from './ast';
import {DyvilLexer} from './parser/DyvilLexer';
import {DyvilParser} from './parser/DyvilParser';
import {CompletionItem, Diagnostic, Position, Range} from "./lint";

export function makeRange(start: Token, stop?: Token) {
  return new Range(
    new Position(start.line, start.charPositionInLine + 1),
    stop ? new Position(stop.line, stop.charPositionInLine + (stop.text?.length || 0) + 1) : new Position(start.line, start.charPositionInLine + (start.text?.length || 0) + 1)
  );
}

export function cleanDoc(doc: Token | undefined): string | undefined {
  return doc?.text?.replace(/^\/\*\*\n?|^\s*\* ?|\s*\*\/$/gm, '');
}

export function compilationUnit(source: string, options?: {
  path?: string;
  comments?: boolean;
  completion?: boolean;
}): CompilationUnit {
  const inputStream = options?.path ? CharStreams.fromString(source, options.path) : CharStreams.fromString(source);
  const lexer = new DyvilLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new DyvilParser(tokenStream);
  const diagnostics: Diagnostic[] = [];
  const errorListener: ANTLRErrorListener<Token> = {
    syntaxError: (recognizer, offendingSymbol, line, charPositionInLine, msg, e) => {
      if (!offendingSymbol) {
        return;
      }
      let expected: CompletionItem[] | undefined;
      if (options?.completion) {
        const expectedTokens = recognizer.state in recognizer.atn.states ? recognizer.atn.getExpectedTokens(recognizer.state, undefined).toArray() : [];
        expected = expectedTokens
          .map(id => DyvilLexer.VOCABULARY.getLiteralName(id))
          .filter((s): s is string => !!s)
          .map((s): CompletionItem => ({
            kind: /^[a-z]+$/.test(s) ? 'keyword' : 'operator',
            label: s.slice(1, -1),
          }))
        ;
      }
      diagnostics.push(new Diagnostic(options?.path, makeRange(offendingSymbol as Token), msg, 'error', expected));
    }
  };
  lexer.removeErrorListeners();
  lexer.addErrorListener(errorListener);
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);
  const compilationUnit = parser.file().cu;
  compilationUnit.diagnostics = diagnostics;

  if (options?.comments) {
    const comments = tokenStream.getTokens().filter(t => t.channel === DyvilLexer.HIDDEN);
    doAttachComments(comments, compilationUnit);
  }

  return compilationUnit;
}

function doAttachComments(comments: Token[], compilationUnit: CompilationUnit) {
  for (const comment of comments) {
    const {
      closest,
      distance
    } = closestNode(compilationUnit, new Position(comment.line, comment.charPositionInLine + 1));
    if (closest) {
      if (distance < 0) {
        closest.commentBefore = (closest.commentBefore ?? '') + comment.text;
      } else {
        closest.commentAfter = (closest.commentAfter ?? '') + comment.text;
      }
    }
  }
}

// find a node in the AST with the smallest distance to the given position
function closestNode(ast: Node<string>, position: Position) {
  let closest: Node<string> | undefined;
  let closestDistance = Infinity;
  for (const node of recurse(ast)) {
    if (node.range?.includes(position) || !node.location) {
      continue;
    }
    const distance = node.location.distance(position);
    if (Math.abs(distance) < Math.abs(closestDistance)) {
      closest = node;
      closestDistance = distance;
    }
  }
  return {closest, distance: closestDistance};
}
