import {Class} from './declarations';
import {report} from './lint';
import {Node} from './node';
import {Ctor, Name, Scope} from './scope';

export function isAssignable(to: AnyType, from: AnyType) {
  switch (from.kind) {
    case 'type:primitive':
      return to.kind === 'type:primitive' && from.name === to.name;
    case 'type:class':
      return to.kind === 'type:class' && from.name === to.name;
    default:
      return false;
  }
}

export class Type<K extends string> extends Node<`type:${K}`> implements Scope {
  constructor(
    kind: K,
  ) {
    super(`type:${kind}`);
  }

  lookup<N extends Node<any>>(name: Name, kind: Ctor<N>): N | undefined {
    return;
  }
}

export class ClassType extends Type<'class'> {
  _class?: Class;

  constructor(
    public name: string,
  ) {
    super('class');
  }

  resolve(scope: Scope): this {
    this._class ||= scope.lookup(this.name, Class) || report(scope, this.location!, `class ${this.name} not found`);
    return this;
  }

  lookup<N extends Node<any>>(name: Name, kind: Ctor<N>): N | undefined {
    return this._class?.lookup(name, kind);
  }

  toString(): string {
    return this.name;
  }
}

export type PrimitiveName = 'int' | 'boolean' | 'string' | 'void';

export class PrimitiveType extends Type<'primitive'> {
  constructor(
    public name: PrimitiveName,
  ) {
    super('primitive');
  }

  toString(): string {
    return this.name;
  }
}

export const ErrorType = new Type('error');

export type AnyType = ClassType | PrimitiveType | typeof ErrorType;
