import {Scope} from './scope';

export type StringFormat = 'plain' | 'js';

export class Position {
  constructor(
    public readonly line: number,
    public readonly column: number,
  ) {
  }
}

export class Range {
  constructor(
    public readonly start: Position,
    public readonly end: Position,
  ) {
  }
}

export class Node<K extends string> {
  location?: Range;

  constructor(
    public kind: K,
  ) {
  }

  resolve(scope: Scope): this {
    // by default, resolve all child nodes
    for (const [key, value] of Object.entries(this)) {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (item instanceof Node) {
            value[i] = item.resolve(scope);
          }
        }
      } else if (value instanceof Node) {
        // @ts-ignore
        this[key] = value.resolve(scope);
      }
    }
    return this;
  }

  toString(format?: StringFormat): string {
    return this.kind;
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
