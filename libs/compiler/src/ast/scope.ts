import {Node} from './node';

export type Name = string | symbol;
export type Ctor<T> = { new(...args: any[]): T };

export interface Scope {
  lookup<N extends Node<any>>(name: Name, kind: Ctor<N>): N | undefined;
}

export class SimpleScope implements Scope {
  constructor(
    private readonly declarations: Record<Name, Node<any>> | (Node<any> & { name: string })[],
    private readonly parent?: Scope,
  ) {
  }

  lookup<N extends Node<any>>(name: Name, kind: Ctor<N>): N | undefined {
    const decl = Array.isArray(this.declarations) ? this.declarations.find(d => d.name === name) : this.declarations[name];
    return decl && decl instanceof kind ? decl : this.parent?.lookup(name, kind);
  }
}
