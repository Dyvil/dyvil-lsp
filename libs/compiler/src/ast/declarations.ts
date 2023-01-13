import {TypeNode} from './types';

export class ClassNode {
  kind = 'class';

  constructor(
    public name: string,
    public fields: FieldNode[] = [],
    public methods: MethodNode[] = [],
  ) {
  }
}

export class FieldNode {
  kind = 'field';

  constructor(
    public name: string,
    public type: TypeNode,
    // value?: ExpressionNode,
  ) {
  }
}

export class MethodNode {
  kind = 'method';

  constructor(
    public name: string,
    public returnType: TypeNode,
    public parameters: ParameterNode[] = [],
    // body?: ExpressionNode,
  ) {
  }
}

export class ParameterNode {
  kind = 'parameter';

  constructor(
    public name: string,
    public type: TypeNode,
  ) {
  }
}
