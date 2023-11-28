import {Class} from './declarations';
import {autocomplete, report} from '../lint';
import {Concept, Node} from './node';
import {Name, Scope} from '../scope';

export function isAssignable(to: Type, from: Type) {
  switch (from.kind) {
    case 'type:primitive':
      return to.kind === 'type:primitive' && from.name === to.name;
    case 'type:class':
      return to.kind === 'type:class' && from.name === to.name;
    default:
      return false;
  }
}

export class BaseType<K extends string> extends Node<`type:${K}`> implements Scope {
  constructor(
    kind: K,
  ) {
    super(`type:${kind}`);
  }

  lookup<N extends Node<any>>(name: Name, concept: Concept<N>, ...args: any[]): N | undefined {
    return;
  }

  list(): Node<any>[] {
    return [];
  }
}

export class ClassType extends BaseType<'class'> {
  _class?: Class;

  constructor(
    public name: string,
  ) {
    super('class');
  }

  resolve(scope: Scope): this {
    if (autocomplete(scope, this.location!, this.name, {
      kind: 'class',
      extra: primitiveCompletions,
    })) {
      return this;
    }
    if (!this._class) {
      this._class ||= scope.lookup(this.name, Class) || report(scope, this.location!, `class ${this.name} not found`);
      this._class?._references.push(this);
    }
    return this;
  }

  lookup<N extends Node<any>>(name: Name, concept: Concept<N>, ...args: any[]): N | undefined {
    return this._class?.lookup(name, concept, ...args);
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
export const primitiveCompletions = primitiveNames.map(name => ({kind: 'keyword', label: name}));

export class PrimitiveType extends BaseType<'primitive'> {
  constructor(
    public name: PrimitiveName,
  ) {
    super('primitive');
  }

  toString(): string {
    return this.name;
  }
}

export const ErrorType = new BaseType('error');

export type Type =
  | ClassType
  | PrimitiveType
  | typeof ErrorType
  ;
