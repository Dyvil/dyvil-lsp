import {Node} from './node';
import {TypeNode} from './types';

export class ClassNode extends Node<'class'> {
  constructor(
    public name: string,
    public fields: FieldNode[] = [],
    public methods: MethodNode[] = [],
  ) {
    super('class');
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
}

export class ParameterNode extends Node<'parameter'> {
  constructor(
    public name: string,
    public type: TypeNode,
  ) {
    super('parameter');
  }
}
