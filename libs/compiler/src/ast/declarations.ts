import {AnyExpression} from './expressions';
import {autoIndent, Node, StringFormat} from './node';
import {Scope} from './scope';
import {Block} from './statements';
import {AnyType} from './types';
import {Type as Ctor} from '@nestjs/common';

export class Class extends Node<'class'> implements Scope {
  constructor(
    public name: string,
    public fields: Field[] = [],
    public constructors: Constructor[] = [],
    public methods: Method[] = [],
  ) {
    super('class');
  }

  toString(format?: StringFormat): string {
    return autoIndent`
    class ${this.name} {
      ${this.fields.map(field => field.toString(format)).join('\n')}

      ${this.constructors.map(field => field.toString(format)).join('\n\n')}

      ${this.methods.map(method => method.toString(format)).join('\n\n')}
    }`;
  }

  lookup<N extends Node<any>>(name: string, kind: Ctor<N>): N | undefined {
    for (let declaration of [...this.fields, ...this.methods]) {
      if (declaration.name === name && declaration instanceof kind) {
        return declaration as N;
      }
    }
  }
}

export class Constructor extends Node<'constructor'> {
  constructor(
    public parameters: Parameter[] = [],
    public body: Block,
  ) {
    super('constructor');
  }

  toString(format?: StringFormat): string {
    return `${format === 'js' ? 'constructor' : 'init'}(${this.parameters.map(param => param.toString(format)).join(', ')}) ${this.body.toString(format)}`;
  }
}

export class Field extends Node<'field'> {
  constructor(
    public name: string,
    public type: AnyType,
    public value?: AnyExpression,
  ) {
    super('field');
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return autoIndent`
      _${this.name}${this.value ? ' = ' + this.value.toString(format) : ''};

      get ${this.name}() {
        return this._${this.name};
      }

      set ${this.name}(value) {
        this._${this.name} = value;
      }`;
    }
    return `var ${this.name}: ${this.type.toString(format)}${this.value ? ' = ' + this.value.toString(format) : ''}`;
  }
}

export class Method extends Node<'method'> {
  constructor(
    public name: string,
    public parameters: Parameter[] = [],
    public returnType: AnyType,
    public body: Block,
  ) {
    super('method');
  }

  toString(format?: StringFormat): string {
    return `${format !== 'js' ? 'func ' : ''}${this.name}(${this.parameters.map(param => param.toString(format)).join(', ')})${format !== 'js' ? ': ' + this.returnType.toString(format) : ''} ${this.body.toString(format)}`;
  }
}

export class Parameter extends Node<'parameter'> {
  constructor(
    public name: string,
    public type: AnyType,
  ) {
    super('parameter');
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return this.name;
    }
    return `${this.name}: ${this.type.toString(format)}`;
  }
}

export class Variable extends Node<'variable'> {
  constructor(
    public name: string,
    public type: AnyType,
    public value: AnyExpression,
  ) {
    super('variable');
  }

  toString(format?: StringFormat): string {
    return `var ${this.name}: ${this.type.toString(format)} = ${this.value.toString(format)}`;
  }
}
