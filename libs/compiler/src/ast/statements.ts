import {AnyExpression} from './expressions';
import {autoIndent, Node, StringFormat} from './node';

class Statement<K extends string> extends Node<`statement:${K}`> {
  constructor(
    kind: K,
  ) {
    super(`statement:${kind}`);
  }
}

export class ExpressionStatement extends Statement<'expr'> {
  constructor(
    public expression: AnyExpression,
  ) {
    super('expr');
  }

  toString(format?: StringFormat): string {
    return this.expression.toString(format);
  }
}

export class Block extends Statement<'block'> {
  constructor(
    public statements: AnyStatement[] = [],
  ) {
    super('block');
  }

  toString(format?: StringFormat): string {
    return autoIndent`
    {
      ${this.statements.map(statement => statement.toString(format) + (format === 'js' ? ';' : '')).join('\n')}
    }`;
  }
}

export const EmptyStatement = new Statement('empty');

export type AnyStatement = ExpressionStatement | Block | typeof EmptyStatement;
