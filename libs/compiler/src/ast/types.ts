import {ClassNode} from './declarations';

export class ClassTypeNode {
  kind = 'type:class';
  class?: ClassNode;

  constructor(
    public name: string,
  ) {
  }
}

export type PrimitiveName = 'int' | 'boolean' | 'string' | 'void';

export class PrimitiveTypeNode {
  kind = 'type:primitive';

  constructor(
    public name: PrimitiveName,
  ) {
  }
}

export class ErrorType {
  kind = 'type:error';
}

export type TypeNode = ClassTypeNode | PrimitiveTypeNode | ErrorType;
