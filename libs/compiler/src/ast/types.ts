import {ClassNode} from './declarations';
import {Node} from './node';
import {Scope} from './scope';

export class ClassTypeNode extends Node<'type:class'> {
  class?: ClassNode;

  constructor(
    public name: string,
  ) {
    super('type:class');
  }

  resolve(scope: Scope): this {
    this.class = scope.resolve(this.name, ClassNode);
    return this;
  }

  toString(): string {
    return this.name;
  }
}

export type PrimitiveName = 'int' | 'boolean' | 'string' | 'void';

export class PrimitiveTypeNode extends Node<'type:primitive'> {
  constructor(
    public name: PrimitiveName,
  ) {
    super('type:primitive');
  }

  toString(): string {
    return this.name;
  }
}

export const ErrorTypeNode = new Node('type:error');

export type TypeNode = ClassTypeNode | PrimitiveTypeNode | typeof ErrorTypeNode;
