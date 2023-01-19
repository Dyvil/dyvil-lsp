import {stripIndents} from 'nx/src/utils/strip-indents';
import {autoIndent, Node} from './node';
import {TypeNode} from './types';

export class ClassNode extends Node<'class'> {
  constructor(
    public name: string,
    public fields: FieldNode[] = [],
    public methods: MethodNode[] = [],
  ) {
    super('class');
  }

  toString(): string {
    return autoIndent`
    class ${this.name} {
      ${this.fields.map(field => field.toString()).join('\n')}

      ${this.methods.map(method => method.toString()).join('\n')}
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

  toString(): string {
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

  toString(): string {
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

  toString(): string {
    return `${this.name}: ${this.type.toString()}`;
  }
}
