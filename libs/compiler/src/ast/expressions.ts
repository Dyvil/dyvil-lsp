import {Class, Constructor, Field, Method, VariableLike} from './declarations';
import {autocomplete, report} from '../lint';
import {Node, StringFormat} from './node';
import {Scope} from '../scope';
import {Type, ErrorType, PrimitiveType} from './types';

abstract class BaseExpression<K extends string> extends Node<`expr:${K}`> {
  protected constructor(
    kind: K,
  ) {
    super(`expr:${kind}`);
  }

  getType(): Type {
    throw new Error(`${this.constructor.name}.getType not implemented`);
  }
}

export class Literal extends BaseExpression<'literal'> {
  constructor(
    public representation: string,
  ) {
    super('literal');
  }

  toString(format?: StringFormat): string {
    return this.before(format) + this.representation + this.after(format);
  }

  getType(): Type {
    switch (this.representation.charAt(0)) {
      case '"':
        return new PrimitiveType('string');
      case 't':
      case 'f':
        return new PrimitiveType('boolean');
      default: // 0-9
        return new PrimitiveType('int');
    }
  }
}

export class VariableReference extends BaseExpression<'variable'> {
  _variable?: VariableLike<string>;

  constructor(
    public name: string = '<unknown>',
  ) {
    super('variable');
  }

  toString(format?: StringFormat): string {
    return this.before(format) + this.name + this.after(format);
  }

  definition(): Node<any> | undefined {
    return this._variable;
  }

  resolve(scope: Scope): this {
    if (autocomplete(scope, this.location!, this.name)) {
      return this;
    }
    if (!this._variable) {
      this._variable ||= scope.lookup(this.name, VariableLike) || report(scope, this.location!, `variable ${this.name} not found`);
    }
    return this;
  }

  getType(): Type {
    return this._variable?.type ?? ErrorType;
  }
}

export class FunctionCall extends BaseExpression<'functionCall'> {
  _constructor?: Constructor;
  _class?: Class;

  constructor(
    public name: string = '<unknown>',
    public args: Expression[] = [],
  ) {
    super('functionCall');
  }

  toString(format?: StringFormat): string {
    return `${this.before(format)}${this.name}(${this.args.map(arg => arg.toString(format)).join(', ')})${this.after(format)}`;
  }

  definition(purpose?: 'rename' | 'definition'): Node<any> | undefined {
    return purpose === 'rename' ? this._class : this._constructor;
  }

  resolve(scope: Scope): this {
    this.args = this.args.map(arg => arg.resolve(scope));
    if (!this._constructor) {
      const cls = scope.lookup(this.name, Class);
      if (cls) {
        const types = this.args.map(arg => arg.getType());
        const ctor = cls.lookup('init', Constructor, types);
        if (ctor) {
          this._class = cls;
          this._constructor = ctor;
        } else {
          report(scope, this.location!, `constructor ${this.name}(${types.join(', ')}) not found`);
        }
      } else {
        report(scope, this.location!, `class or function ${this.name} not found`);
      }
    }
    return this;
  }

  getType(): Type {
    return this._class?.asType() ?? ErrorType;
  }
}

export class PropertyAccess extends BaseExpression<'propertyAccess'> {
  _field?: Field;

  constructor(
    public receiver: Expression = ErrorExpression,
    public property: string = '<unknown>',
  ) {
    super('propertyAccess');
  }

  toString(format?: StringFormat): string {
    return `${this.receiver.toString(format)}.${this.property}`;
  }

  definition(): Node<any> | undefined {
    return this._field;
  }

  resolve(scope: Scope): this {
    this.receiver = this.receiver.resolve(scope);
    const objectType = this.receiver.getType();
    if (autocomplete(scope, this.location!, this.property, {lookup: objectType})) {
      return this;
    }

    if (!this._field) {
      this._field ||= objectType.lookup(this.property, Field) || report(scope, this.location!, `field ${this.property} not found on ${objectType}`);
    }
    return this;
  }

  getType(): Type {
    return this._field?.type || ErrorType;
  }
}

export class MethodCall extends BaseExpression<'methodCall'> {
  _method?: Method;

  constructor(
    public receiver: Expression = ErrorExpression,
    public method: string = '<unknown>',
    public args: Expression[] = [],
  ) {
    super('methodCall');
  }

  definition(): Node<any> | undefined {
    return this._method;
  }

  toString(format?: StringFormat): string {
    const name = this._method && format === 'js' ? this._method.jsName : this.method;
    return `${this.receiver.toString(format)}.${name}(${this.args.map(arg => arg.toString(format)).join(', ')})`;
  }

  resolve(scope: Scope): this {
    this.receiver = this.receiver.resolve(scope);
    this.args = this.args.map(arg => arg.resolve(scope));
    if (!this._method) {
      const objectType = this.receiver.getType();
      const argTypes = this.args.map(a => a.getType());
      this._method ||= objectType.lookup(this.method, Method, argTypes) || report(scope, this.location!, `method ${this.method} not found on ${objectType}`);
    }
    return this;
  }

  getType(): Type {
    return this._method?.returnType || ErrorType;
  }
}

export class BinaryOperation extends BaseExpression<'binary'> {
  constructor(
    public lhs: Expression = ErrorExpression,
    public operator: string = '<unknown>',
    public rhs: Expression = ErrorExpression,
  ) {
    super('binary');
  }

  lint(scope: Scope) {
    if (this.operator === '==' && this.range) {
      if (this.lhs.kind === 'expr:literal' && this.lhs.representation === 'true') {
        report(scope, this.range, '`== true` is redundant', 'warning', this.rhs);
      }
      if (this.rhs.kind === 'expr:literal' && this.rhs.representation === 'true') {
        report(scope, this.range, '`== true` is redundant', 'warning', this.lhs);
      }
    }
    super.lint(scope);
  }

  toString(format?: StringFormat): string {
    return `${this.lhs.toString(format)} ${this.operator} ${this.rhs.toString(format)}`;
  }

  getType(): Type {
    switch (this.operator) {
      case '+':
        const lhsType = this.lhs.getType();
        const rhsType = this.rhs.getType();
        if (lhsType.kind === 'type:primitive' && lhsType.name === 'string') {
          return lhsType;
        }
        if (rhsType.kind === 'type:primitive' && rhsType.name === 'string') {
          return rhsType;
        }
        return new PrimitiveType('int');
      case '&&':
      case '||':
      case '==':
      case '!=':
      case '<':
      case '<=':
      case '>':
      case '>=':
        return new PrimitiveType('boolean');
      case '-':
      case '*':
      case '/':
      case '%':
      case '<<':
      case '>>':
      case '>>>':
      case '&':
      case '|':
      case '^':
        return new PrimitiveType('int');
      default:
        return ErrorType;
    }
  }
}

export class ParenthesizedExpression extends BaseExpression<'parenthesized'> {
  constructor(
    public expression: Expression = ErrorExpression,
  ) {
    super('parenthesized');
  }

  toString(format?: StringFormat): string {
    return `(${this.expression.toString(format)})`;
  }

  getType(): Type {
    return this.expression.getType();
  }
}

export const ErrorExpression = new class extends BaseExpression<'error'> {
  constructor() {
    super('error');
  }

  getType(): Type {
    return ErrorType;
  }
};

export type Expression =
  | Literal
  | VariableReference
  | FunctionCall
  | PropertyAccess
  | MethodCall
  | BinaryOperation
  | ParenthesizedExpression
  | typeof ErrorExpression
  ;
