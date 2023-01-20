import {Class} from './declarations';
import {Node} from './node';
import {Scope} from './scope';

export class ClassType extends Node<'type:class'> {
  _class?: Class;

  constructor(
    public name: string,
  ) {
    super('type:class');
  }

  resolve(scope: Scope): this {
    this._class = scope.resolve(this.name, Class);
    return this;
  }

  toString(): string {
    return this.name;
  }
}

export type PrimitiveName = 'int' | 'boolean' | 'string' | 'void';

export class PrimitiveType extends Node<'type:primitive'> {
  constructor(
    public name: PrimitiveName,
  ) {
    super('type:primitive');
  }

  toString(): string {
    return this.name;
  }
}

export const ErrorType = new Node('type:error');

export type AnyType = ClassType | PrimitiveType | typeof ErrorType;
