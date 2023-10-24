import {Variable} from './declarations';
import {AnyExpression} from './expressions';
import {autocomplete} from './lint';
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
  static keyword = 'var';
  static snippet = 'var \${1:name} = \${2:value}';

  constructor(
    public variable: Variable,
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
    const variables: Variable[] = [];
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

export class WhileStatement extends Statement<'while'> {
  static keyword = 'while';
  static snippet = `while (\${1:condition}) {
  \${2:statements...}
}`;

  constructor(
    public condition: AnyExpression,
    public body: Block,
  ) {
    super('while');
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return `while (${this.condition.toString(format)}) ${this.body.toString(format)}`;
    }
    return `while ${this.condition.toString(format)} ${this.body.toString(format)}`;
  }
}

export class CompletionStatement extends Statement<'completion'> {
  constructor() {
    super('completion');
  }

  toString(): string {
    return '§';
  }

  resolve(scope: Scope): this {
    autocomplete(scope, this.location!, '§', {
      extra: CompletableStatements.map(statement => ({
        kind: 'keyword',
        label: statement.keyword,
        snippet: statement.snippet,
      })),
    });
    return this;
  }
}

export const EmptyStatement = new Statement('empty');

export const CompletableStatements = [
  WhileStatement,
  VarStatement,
] as const;

export type AnyStatement =
  | VarStatement
  | ExpressionStatement
  | Block
  | CompletionStatement
  | WhileStatement
  | typeof EmptyStatement
  ;
