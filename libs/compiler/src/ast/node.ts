import {Position, Range} from './lint';
import {Scope} from './scope';

export type StringFormat = 'plain' | 'js';

export class Node<K extends string> {
  location?: Range;

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

  references(purpose?: 'rename' | 'definition'): Range[] {
    return this.definition(purpose)?.references(purpose) || [];
  }

  resolve(scope: Scope): this {
    eachChild(this, node => node.resolve(scope));
    return this;
  }

  findByPosition(position: Position): Node<any>[] | undefined {
    let child: Node<any>[] | undefined = undefined;
    eachChild(this, node => {
      child ||= node.findByPosition(position);
      return node;
    });
    if (child) {
      return [this, ...child];
    }
    if (this.location?.includes(position)) {
      return [this];
    }
    return undefined;
  }

  toString(format?: StringFormat): string {
    return this.kind;
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
