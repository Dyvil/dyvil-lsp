import {Position, Range} from '../lint';
import {Scope} from '../scope';

export type StringFormat = 'plain' | 'js';

export type Concept<T> = { new(...args: any[]): T };

/**
 * Checks whether the first concept is a sub-concept of the second concept.
 * Roughly equivalent to `new sub() instanceof sup`.
 * @see https://stackoverflow.com/a/18939541/4138801
 * @example
 * class A {}
 * class B extends A {}
 * class C extends B {}
 *
 * isSubConcept(A, A) // true
 * isSubConcept(B, A) // true
 * isSubConcept(C, A) // true
 * isSubConcept(A, B) // false
 * isSubConcept(B, C) // false
 * isSubConcept(C, B) // false
 *
 * @param sub the sub-concept
 * @param sup the super-concept
 */
export function isSubConcept(sub: Concept<any>, sup: Concept<any>): boolean {
  return sub === sup || sub.prototype instanceof sup;
}

export class Node<K extends string> {
  location?: Range;
  range?: Range;

  constructor(
    public kind: K,
  ) {
  }

  definition(purpose?: 'rename' | 'definition'): Node<any> | undefined {
    return undefined;
  }

  documentation(): string | undefined {
    return this.definition()?.documentation();
  }

  references(purpose?: 'rename' | 'definition'): Node<string>[] {
    return this.definition(purpose)?.references(purpose) || [];
  }

  resolve(scope: Scope): this {
    eachChild(this, node => node.resolve(scope));
    return this;
  }

  link() {
    for (const [key, value] of Object.entries(this)) {
      if (key.startsWith('_') && '_references' in value) {
        value._references.push(this);
      }
    }
    for (const child of children(this)) {
      child.link();
    }
  }

  findByPosition(position: Position): Node<any>[] | undefined {
    if (this.range && !this.range.includes(position)) {
      return;
    }
    for (const child of children(this)) {
      const result = child.findByPosition(position);
      if (result) {
        return [this, ...result];
      }
    }
    if (this.location?.includes(position)) {
      return [this];
    }
    return undefined;
  }

  toString(format?: StringFormat): string {
    return `<${this.kind}>`;
  }
}

function eachChild(node: Node<any>, replacer: (n: Node<any>) => Node<any>) {
  for (const [key, value] of Object.entries(node)) {
    if (key === 'location' || key === 'kind' || key.startsWith('_') || !value) {
      continue;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item instanceof Node) {
          value[i] = replacer(value[i]);
        }
      }
    } else if (value instanceof Node) {
      // @ts-ignore
      node[key] = replacer(value);
    }
  }
}

/**
 * Iterates over all nodes in the tree.
 * @param node the root node
 */
export function* recurse(node: Node<any>): Generator<Node<any>> {
  yield node;
  for (const child of children(node)) {
    yield* recurse(child);
  }
}

/**
 * Iterates over all children of a node.
 * @param node the parent node
 */
export function* children(node: Node<any>): Generator<Node<any>> {
  for (const [key, value] of Object.entries(node)) {
    if (key === 'location' || key === 'kind' || key.startsWith('_') || !value) {
      continue;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item instanceof Node) {
          yield value[i];
        }
      }
    } else if (value instanceof Node) {
      yield value;
    }
  }
}

/**
 * Simple template tag for indenting multi-line strings.
 * The first line of the first string must always be empty (i.e. there must be a line break after `).
 * The second line of the first string determines the indentation level.
 * Every template insertion will respect the indentation level of the current line.
 * Example:
 * ```js
 * const fn = `func main() {
 *   // ...
 * }`
 * const cls = autoIndent`
 * class Foo {
 *   ${fn}
 * }`
 * ```
 * will set `cls` to
 * ```
 * class Foo {
 *   func main() {
 *     // ...
 *   }
 * }
 * ```
 *
 * Without the `autoIndent` tag, the result would be
 * ```
 * class Foo {
 *   func main() {
 *   // ...
 * }
 * }
 * ```
 *
 * @param strings
 * @param values
 */
export function autoIndent(strings: TemplateStringsArray, ...values: any[]): string {
  if (!strings[0].startsWith('\n')) {
    throw new Error('must start with a newline');
  }
  const indent = strings[0].match(/^\n([ \t]*)/)![1];
  return strings.map((string, i) => {
    if (i === 0) {
      string = string.substring(1 + indent.length);
    }
    string = string.replace(new RegExp('^' + indent, 'gm'), '');
    const lastLine = string.substring(string.lastIndexOf('\n') + 1);
    const lastLineIndent = lastLine.match(/^\s*/)![0];
    const value = values[i] ?? '';
    const indentedValue = value.toString().replace(/\n/g, `\n${lastLineIndent}`);
    return string + indentedValue;
  }).join('');
}
