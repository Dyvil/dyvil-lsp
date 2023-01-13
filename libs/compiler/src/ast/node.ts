import {Scope} from './scope';

export class Node<K> {
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
        this[key] = value.resolve(scope);
      }
    }
    return this;
  }
}

