import {ClassContext, FieldContext, MethodContext, ParameterContext, TypeContext} from '../parser/DyvilParser';
import {ClassNode, FieldNode, MethodNode, ParameterNode} from './declarations';
import {ClassTypeNode, PrimitiveName, PrimitiveTypeNode, TypeNode} from './types';

export function classNode(ctx: ClassContext): ClassNode {
  return new ClassNode(ctx._name.text, ctx.field().map(fieldNode), ctx.method().map(methodNode));
}

export function fieldNode(ctx: FieldContext): FieldNode {
  return new FieldNode(ctx._name.text, typeNode(ctx.type()));
}

export function methodNode(ctx: MethodContext): MethodNode {
  return new MethodNode(ctx._name.text, typeNode(ctx.type()), ctx.parameter().map(parameterNode));
}

export function parameterNode(ctx: ParameterContext): ParameterNode {
  return new ParameterNode(ctx._name.text, typeNode(ctx.type()));
}

export function typeNode(typeContext: TypeContext): TypeNode {
  let classType = typeContext.classType();
  return classType ? new ClassTypeNode(classType.text) : new PrimitiveTypeNode(typeContext.primitiveType().text as PrimitiveName);
}
