import {Class} from './declarations';
import {Node} from './node';
import {Scope} from './scope';

import type {Type as Ctor} from '@nestjs/common';

export class Type<K extends string> extends Node<`type:${K}`> implements Scope {
  constructor(
    kind: K,
  ) {
    super(`type:${kind}`);
  }

  lookup<N extends Node<any>>(name: string, kind: Ctor<N>): N | undefined {
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
    this._class = scope.lookup(this.name, Class);
    return this;
  }

  lookup<N extends Node<any>>(name: string, kind: Ctor<N>): N | undefined {
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
