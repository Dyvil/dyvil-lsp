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

export type Severity = 'error' | 'warning' | 'note';

export function log(file: string, {start: {column, line}}: Range, message: string, severity: Severity = 'error'): void {
  switch (severity) {
    case 'error':
      console.error(`${file}:${line}:${column}: error: ${message}`);
      break;
    case 'warning':
      console.warn(`${file}:${line}:${column}: warning: ${message}`);
      break;
    case 'note':
      console.info(`${file}:${line}:${column}: note: ${message}`);
      break;
  }
}

export function report(scope: Scope, location: Range, message: string, severity: Severity = 'error'): undefined {
  const unit = scope.lookup(CompilationUnit.enclosing, CompilationUnit);
  if (unit) {
    unit.report(location, message, severity);
  } else {
    log('unknown', location, message, severity);
  }
  return;
}
