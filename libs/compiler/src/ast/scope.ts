import {Type} from '@nestjs/common';
import {Node} from './node';

export interface Scope {
  lookup<N extends Node<any>>(name: string, kind: Type<N>): N | undefined;
}

export class SimpleScope implements Scope {
  constructor(
    readonly declarations: (Node<any> & { name: string })[],
    private readonly parent?: Scope,
  ) {
  }

  lookup<N extends Node<any>>(name: string, kind: Type<N>): N | undefined {
    const decl = this.declarations.find((decl) => decl.name === name && decl instanceof kind);
    return decl ? decl as unknown as N : this.parent?.lookup(name, kind);
  }
}
