import {Variable} from './declarations';
import {ErrorExpression, Expression} from './expressions';
import {autocomplete, CompletionItem} from '../lint';
import {autoIndent, CommentAware, Node, ParserMethod, StringFormat} from './node';
import {Scope, SimpleScope} from '../scope';

class Statement<K extends string> extends Node<`statement:${K}`> {
  constructor(
    kind: K,
  ) {
    super(`statement:${kind}`);
  }
}

export class VarStatement extends Statement<'variable'> {
  static completion: CompletionItem = {
    kind: 'keyword',
    label: 'var',
    snippet: 'var \${1:name} = \${2:value}',
  };

  constructor(
    public variable: Variable,
  ) {
    super('variable');
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    return this.variable.toString(format);
  }
}

export class ExpressionStatement extends Statement<'expr'> {
  constructor(
    public expression: Expression,
  ) {
    super('expr');
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    return this.expression.toString(format);
  }
}

export class Block extends Statement<'block'> {
  static parser: ParserMethod = 'blockStatement';

  constructor(
    public statements: AnyStatement[] = [],
  ) {
    super('block');
  }

  @CommentAware()
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
  static completion: CompletionItem = {
    kind: 'keyword',
    label: 'while',
    snippet: 'while (\${1:condition}) {\n  \${2:statements...}\n}',
  }

  constructor(
    public condition: Expression = ErrorExpression,
    public body: Block = new Block(),
  ) {
    super('while');
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    if (format === 'js') {
      return `while (${this.condition.toString(format)}) ${this.body.toString(format)}`;
    }
    return `while ${this.condition.toString(format)} ${this.body.toString(format)}`;
  }
}

export class IfStatement extends Statement<'while'> {
  static completion: CompletionItem = {
    kind: 'keyword',
    label: 'if',
    snippet: 'if (\${1:condition}) {\n  \${2:statements...}\n}',
  }

  else?: Block | IfStatement;
  completion?: boolean;

  constructor(
    public condition: Expression = ErrorExpression,
    public then: Block = new Block(),
    _else?: Block | IfStatement,
  ) {
    super('while');
    this.else = _else;
  }

  resolve(scope: Scope): this {
    this.completion && autocomplete(scope, this.location!, '§', {
      extra: [{
        kind: 'keyword',
        label: 'else',
        snippet: 'else {\n  \${1:statements...}\n}',
      }],
    });
    return super.resolve(scope);
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    return `if ${format === 'js' ? '(' : ''}${this.condition.toString(format)}${format === 'js' ? ')' : ''} ${this.then.toString(format)}${this.else ? ` else ${this.else.toString(format)}` : ''}`;
  }
}

export class CompletionStatement extends Statement<'completion'> {
  static completions = [
    WhileStatement,
    VarStatement,
    IfStatement,
  ].map(c => c.completion);

  constructor(
    public completion: string,
  ) {
    super('completion');
  }

  toString(): string {
    return this.completion;
  }

  resolve(scope: Scope): this {
    autocomplete(scope, this.location!, this.completion, {
      extra: CompletionStatement.completions,
    });
    return this;
  }
}

export const EmptyStatement = new Statement('empty');

export type AnyStatement =
  | VarStatement
  | ExpressionStatement
  | Block
  | CompletionStatement
  | WhileStatement
  | IfStatement
  | typeof EmptyStatement
  ;
