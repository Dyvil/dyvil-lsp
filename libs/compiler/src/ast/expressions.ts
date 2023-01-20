import {Node, StringFormat} from './node';

abstract class Expression<K extends string> extends Node<`expr:${K}`> {
  protected constructor(
    kind: K,
  ) {
    super(`expr:${kind}`);
  }
}

export class Literal extends Expression<'literal'> {
  constructor(
    public representation: string,
  ) {
    super('literal');
  }

  toString(): string {
    return this.representation;
  }
}

export class VariableReference extends Expression<'variable'> {
  constructor(
    public name: string,
  ) {
    super('variable');
  }

  toString(): string {
    return this.name;
  }
}

export class FunctionCall extends Expression<'functionCall'> {
  constructor(
    public name: string,
    public args: AnyExpression[],
  ) {
    super('functionCall');
  }

  toString(format?: StringFormat): string {
    return `${this.name}(${this.args.map(arg => arg.toString(format)).join(', ')})`;
  }
}

export class PropertyAccess extends Expression<'propertyAccess'> {
  constructor(
    public object: AnyExpression,
    public property: string,
  ) {
    super('propertyAccess');
  }

  toString(format?: StringFormat): string {
    return `${this.object.toString(format)}.${this.property}`;
  }
}

export class MethodCall extends Expression<'methodCall'> {
  constructor(
    public object: AnyExpression,
    public method: string,
    public args: AnyExpression[],
  ) {
    super('methodCall');
  }

  toString(format?: StringFormat): string {
    return `${this.object.toString(format)}.${this.method}(${this.args.map(arg => arg.toString(format)).join(', ')})`;
  }
}

export class BinaryOperation extends Expression<'binary'> {
  constructor(
    public lhs: AnyExpression,
    public operator: string,
    public rhs: AnyExpression,
  ) {
    super('binary');
  }

  toString(format?: StringFormat): string {
    return `${this.lhs.toString(format)} ${this.operator} ${this.rhs.toString(format)}`;
  }
}

export class ParenthesizedExpression extends Expression<'parenthesized'> {
  constructor(
    public expression: AnyExpression,
  ) {
    super('parenthesized');
  }

  toString(format?: StringFormat): string {
    return `(${this.expression.toString(format)})`;
  }
}

export type AnyExpression =
  | Literal
  | VariableReference
  | FunctionCall
  | PropertyAccess
  | MethodCall
  | BinaryOperation
  | ParenthesizedExpression
;
