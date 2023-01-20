import {AnyExpression} from './expressions';
import {autoIndent, Node, StringFormat} from './node';
import {Block} from './statements';
import {TypeNode} from './types';

export class ClassNode extends Node<'class'> {
  constructor(
    public name: string,
    public fields: FieldNode[] = [],
    public constructors: ConstructorNode[] = [],
    public methods: MethodNode[] = [],
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
}

export class ConstructorNode extends Node<'constructor'> {
  constructor(
    public parameters: ParameterNode[] = [],
    public body: Block,
  ) {
    super('constructor');
  }

  toString(format?: StringFormat): string {
    return `${format === 'js' ? 'constructor' : 'init'}(${this.parameters.map(param => param.toString(format)).join(', ')}) ${this.body.toString(format)}`;
  }
}

export class FieldNode extends Node<'field'> {
  constructor(
    public name: string,
    public type: TypeNode,
    public value?: AnyExpression,
  ) {
    super('field');
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return autoIndent`
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

export class MethodNode extends Node<'method'> {
  constructor(
    public name: string,
    public parameters: ParameterNode[] = [],
    public returnType: TypeNode,
    public body: Block,
  ) {
    super('method');
  }

  toString(format?: StringFormat): string {
    return `${format !== 'js' ? 'func ' : ''}${this.name}(${this.parameters.map(param => param.toString(format)).join(', ')})${format !== 'js' ? ': ' + this.returnType.toString(format) : ''} ${this.body.toString(format)}`;
  }
}

export class ParameterNode extends Node<'parameter'> {
  constructor(
    public name: string,
    public type: TypeNode,
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

export class VarDeclaration extends Node<'variable'> {
  constructor(
    public name: string,
    public type: TypeNode,
    public value: AnyExpression,
  ) {
    super('variable');
  }

  toString(format?: StringFormat): string {
    return `var ${this.name}: ${this.type.toString(format)} = ${this.value.toString(format)}`;
  }
}
