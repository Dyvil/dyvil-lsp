import {Class, Constructor, Field, Method, Parameter, Variable} from './declarations';
import {CompletionItem, report} from './lint';
import {Node, StringFormat} from './node';
import {Scope} from './scope';
import {AnyType, ErrorType, PrimitiveType} from './types';

abstract class Expression<K extends string> extends Node<`expr:${K}`> {
  protected constructor(
    kind: K,
  ) {
    super(`expr:${kind}`);
  }

  getType(): AnyType {
    throw new Error(`${this.constructor.name}.getType not implemented`);
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

  getType(): AnyType {
    switch (this.representation.charAt(0)) {
      case '"':
        return new PrimitiveType('string');
      case 't': case 'f':
        return new PrimitiveType('boolean');
      default: // 0-9
        return new PrimitiveType('int');
    }
  }
}

export class VariableReference extends Expression<'variable'> {
  _variable?: Variable | Parameter;

  constructor(
    public name: string,
  ) {
    super('variable');
  }

  toString(): string {
    return this.name;
  }

  resolve(scope: Scope): this {
    this._variable ||= scope.lookup(this.name, Variable) || scope.lookup(this.name, Parameter) || report(scope, this.location!, `variable ${this.name} not found`);
    return this;
  }

  getType(): AnyType {
    return this._variable?.type ?? ErrorType;
  }
}

export class FunctionCall extends Expression<'functionCall'> {
  _constructor?: Constructor;

  constructor(
    public name: string,
    public args: AnyExpression[],
  ) {
    super('functionCall');
  }

  toString(format?: StringFormat): string {
    return `${this.name}(${this.args.map(arg => arg.toString(format)).join(', ')})`;
  }

  resolve(scope: Scope): this {
    this.args = this.args.map(arg => arg.resolve(scope));
    const types = this.args.map(arg => arg.getType());
    if (!this._constructor) {
      const cls = scope.lookup(this.name, Class);
      if (cls) {
        const ctor = cls.findConstructor(types);
        if (ctor) {
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

  getType(): AnyType {
    return this._constructor?._thisClass?.asType() ?? ErrorType;
  }
}

export class PropertyAccess extends Expression<'propertyAccess'> {
  _field?: Field;

  constructor(
    public object: AnyExpression,
    public property: string,
  ) {
    super('propertyAccess');
  }

  toString(format?: StringFormat): string {
    return `${this.object.toString(format)}.${this.property}`;
  }

  resolve(scope: Scope): this {
    this.object = this.object.resolve(scope);
    const objectType = this.object.getType();
    this._field ||= objectType.lookup(this.property, Field) || report(scope, this.location!, `field ${this.property} not found on ${objectType}`);
    return this;
  }

  getType(): AnyType {
    return this._field?.type || ErrorType;
  }
}

export class MethodCall extends Expression<'methodCall'> {
  _method?: Method;

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

  resolve(scope: Scope): this {
    this.object = this.object.resolve(scope);
    this.args = this.args.map(arg => arg.resolve(scope));
    const objectType = this.object.getType();
    this._method ||= objectType.lookup(this.method, Method) || report(scope, this.location!, `method ${this.method} not found on ${objectType}`);
    return this;
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

  getType(): AnyType {
    switch (this.operator) {
      case '+':
        let lhsType = this.lhs.getType();
        let rhsType = this.rhs.getType();
        if (lhsType.kind === 'type:primitive' && lhsType.name === 'string') {
          return lhsType;
        }
        if (rhsType.kind === 'type:primitive' && rhsType.name === 'string') {
          return rhsType;
        }
        return new PrimitiveType('int');
      case '&&': case '||': case '==': case '!=': case '<': case '<=': case '>': case '>=':
        return new PrimitiveType('boolean');
      case '-': case '*': case '/': case '%':
      case '<<': case '>>': case '>>>':
      case '&': case '|': case '^':
        return new PrimitiveType('int');
      default:
        return ErrorType;
    }
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

  getType(): AnyType {
    return this.expression.getType();
  }
}

export class CompletionExpression extends Expression<'completion'> {
  constructor() {
    super('completion');
  }

  toString(): string {
    return '§';
  }

  getType(): AnyType {
    return ErrorType;
  }

  resolve(scope: Scope): this {
    const expected = scope.list()
      .filter((d): d is Node<any> & { name: string } => 'name' in d)
      .map((d): CompletionItem => ({kind: d.kind, label: d.name}))
    ;
    report(scope, this.location!, 'input \'§\' expecting', 'error', expected);
    return this;
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
  | CompletionExpression
  ;
