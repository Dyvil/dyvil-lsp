import {VarDeclaration} from './declarations';
import {AnyExpression} from './expressions';
import {autoIndent, Node, StringFormat} from './node';
import {Scope, SimpleScope} from './scope';

class Statement<K extends string> extends Node<`statement:${K}`> {
  constructor(
    kind: K,
  ) {
    super(`statement:${kind}`);
  }
}

export class VarStatement extends Statement<'variable'> {
  constructor(
    public variable: VarDeclaration,
  ) {
    super('variable');
  }

  toString(format?: StringFormat): string {
    return this.variable.toString(format);
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

  resolve(scope: Scope): this {
    const variables: VarDeclaration[] = [];
    const newScope = new SimpleScope(variables, scope);
    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i] = this.statements[i].resolve(newScope);
      if (statement.kind === 'statement:variable') {
        variables.push(statement.variable);
      }
    }
    return this;
  }
}

export const EmptyStatement = new Statement('empty');

export type AnyStatement =
  | VarStatement
  | ExpressionStatement
  | Block
  | typeof EmptyStatement
;
