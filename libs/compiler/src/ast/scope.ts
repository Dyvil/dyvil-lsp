import {Concept, Node} from './node';

export type Name = string | symbol;

export interface Scope {
  lookup<N extends Node<any>>(name: Name, concept: Concept<N>, ...args: any[]): N | undefined;

  list(): Node<any>[];
}

export class SimpleScope implements Scope {
  constructor(
    private readonly declarations: Record<Name, Node<any>> | (Node<any> & { name: string })[],
    private readonly parent?: Scope,
  ) {
  }

  lookup<N extends Node<any>>(name: Name, concept: Concept<N>): N | undefined {
    const decl = Array.isArray(this.declarations)
      ? this.declarations.find(d => d.name === name && d instanceof concept) as N | undefined
      : this.declarations[name] instanceof concept
        ? this.declarations[name] as N : undefined;
    return decl ?? this.parent?.lookup(name, concept);
  }

  list(): Node<any>[] {
    const own = Array.isArray(this.declarations) ? this.declarations : Object.values(this.declarations);
    return this.parent ? [...own, ...this.parent.list()] : own;
  }
}
