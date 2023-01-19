import {stripIndents} from 'nx/src/utils/strip-indents';
import {autoIndent, Node, StringFormat} from './node';
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
  ) {
    super('constructor');
  }

  toString(format?: StringFormat): string {
    return autoIndent`
    ${format === 'js' ? 'constructor' : 'init'}(${this.parameters.map(param => param.toString(format)).join(', ')}) {
      // TODO body
    }`;
  }
}

export class FieldNode extends Node<'field'> {
  constructor(
    public name: string,
    public type: TypeNode,
    // value?: ExpressionNode,
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
    return `var ${this.name}: ${this.type.toString()}`;
  }
}

export class MethodNode extends Node<'method'> {
  constructor(
    public name: string,
    public returnType: TypeNode,
    public parameters: ParameterNode[] = [],
    // body?: ExpressionNode,
  ) {
    super('method');
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return autoIndent`
      ${this.name}(${this.parameters.map(param => param.toString(format)).join(', ')}) {
        // TODO body
      }`;
    }
    return autoIndent`
    func ${this.name}(${this.parameters.map(parameter => parameter.toString()).join(', ')}): ${this.returnType.toString()} {
      // TODO body
    }`;
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
    return `${this.name}: ${this.type.toString()}`;
  }
}
