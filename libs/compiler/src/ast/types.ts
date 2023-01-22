import {Class} from './declarations';
import {CompletionItem, report} from './lint';
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

  list(): Node<any>[] {
    return [];
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

  list(): Node<any>[] {
    return this._class?.list() ?? [];
  }

  toString(): string {
    return this.name;
  }
}

export const primitiveNames = ['int', 'boolean', 'string', 'void'] as const;
export type PrimitiveName = typeof primitiveNames[number];

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

export class CompletionType extends Type<'completion'> {
  constructor() {
    super('completion');
  }

  toString(): string {
    return '§';
  }

  resolve(scope: Scope): this {
    const expected = scope.list()
      .filter((d): d is Class => d.kind === 'class')
      .map((d): CompletionItem => ({kind: d.kind, label: d.name}))
    ;
    report(scope, this.location!, 'input \'§\' expecting', 'error', [
      ...expected,
      ...primitiveNames.map(name => ({kind: 'keyword', label: name})),
    ]);
    return this;
  }
}

export const ErrorType = new Type('error');

export type AnyType =
  | ClassType
  | PrimitiveType
  | CompletionType
  | typeof ErrorType
;
