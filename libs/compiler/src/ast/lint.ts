import {CompilationUnit} from './declarations';
import {Scope} from './scope';

export class Position {
  constructor(
    public readonly line: number,
    public readonly column: number,
  ) {
  }
}

export class Range {
  constructor(
    public readonly start: Position,
    public readonly end: Position,
  ) {
  }
}

export interface CompletionItem {
  kind: string;
  label: string;
  detail?: string;
}

export class Diagnostic {
  constructor(
    public readonly path: string | undefined,
    public readonly location: Range,
    public readonly message: string,
    public readonly severity: Severity = 'error',
    public readonly expected?: CompletionItem[],
  ) {
    if (!location) {
      throw new Error('location is required');
    }
  }
}

export type Severity = 'error' | 'warning' | 'note';

export function log(diagnostic: Diagnostic): void {
  const {path, location: {start: {line, column}}, message, severity} = diagnostic;
  switch (severity) {
    case 'error':
      console.error(`${path}:${line}:${column}: error: ${message}`);
      break;
    case 'warning':
      console.warn(`${path}:${line}:${column}: warning: ${message}`);
      break;
    case 'note':
      console.info(`${path}:${line}:${column}: note: ${message}`);
      break;
  }
}

export function report(scope: Scope, location: Range, message: string, severity: Severity = 'error', expected?: CompletionItem[]): undefined {
  const unit = scope.lookup(CompilationUnit.enclosing, CompilationUnit);
  const diagnostic = new Diagnostic(undefined, location, message, severity, expected);
  if (unit) {
    unit.report(diagnostic);
  } else {
    log(diagnostic);
  }
  return;
}
