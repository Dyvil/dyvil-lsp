grammar Dyvil;

@header {
import * as ast from '../ast';
import {PrimitiveName} from '../ast';
}

file: class;

class returns [ast.ClassNode cn]:
  'class' name=ID '{' (fields+=field | constructors+=ctor | methods+=method)* '}'
  { $cn = new ast.ClassNode($name.text, $fields.map(f => f.fn), $constructors.map(c => c.cn), $methods.map(m => m.mn)) }
;
field returns [ast.FieldNode fn]:
  'var' name=ID ':' type ('=' expression)? ';'?
  { $fn = new ast.FieldNode($name.text, $type.tn, $expression.e) }
;
ctor returns [ast.ConstructorNode cn]:
  'init' '(' (parameters+=parameter ','?)* ')' blockStatement
  { $cn = new ast.ConstructorNode($parameters.map(p => p.pn), $blockStatement.bs) }
;
method returns [ast.MethodNode mn]:
  'func' name=ID '(' (parameters+=parameter ','?)* ')' ':' type blockStatement
  { $mn = new ast.MethodNode($name.text, $parameters.map(p => p.pn), $type.tn, $blockStatement.bs) }
;
parameter returns [ast.ParameterNode pn]:
  name=ID ':' type
  { $pn = new ast.ParameterNode($name.text, $type.tn) }
;

type returns [ast.TypeNode tn]:
  primitiveType { $tn = new ast.PrimitiveTypeNode($primitiveType.text as PrimitiveName) }
  |
  className=ID { $tn = new ast.ClassTypeNode($className.text) }
;
primitiveType: 'int' | 'boolean' | 'string' | 'void';

statement returns [ast.AnyStatement s]:
  'var' name=ID ':' type '=' expression { $s = new ast.VarStatement(new ast.VarDeclaration($name.text, $type.tn, $expression.e)) }
  |
  expression { $s = new ast.ExpressionStatement($expression.e) }
  |
  blockStatement {$s = $blockStatement.bs }
  |
  ';' { $s = ast.EmptyStatement }
;
blockStatement returns [ast.Block bs]:
  '{' (statements+=statement)* '}' { $bs = new ast.Block($statements.map(s => s.s)) }
;

expression returns [ast.AnyExpression e]:
  object=expression '.' name=ID '(' (arguments+=expression)* ')' { $e = new ast.MethodCall($object.e, $name.text, $arguments.map(a => a.e)) }
  |
  object=expression '.' name=ID { $e = new ast.PropertyAccess($object.e, $name.text) }
  |
  lhs=expression op=OPERATOR rhs=expression { $e = new ast.BinaryOperation($lhs.e, $op.text, $rhs.e) }
  |<assoc=right>
  lhs=expression '=' rhs=expression { $e = new ast.BinaryOperation($lhs.e, '=', $rhs.e) }
  |
  name=ID '(' (arguments+=expression)* ')' { $e = new ast.FunctionCall($name.text, $arguments.map(a => a.e)) }
  |
  name=ID { $e = new ast.VariableReference($name.text) }
  |
  '(' expression ')' { $e = new ast.ParenthesizedExpression($expression.e) }
  |
  literal { $e = $literal.l }
;
literal returns [ast.Literal l]: (NUMBER | STRING | 'true' | 'false') { $l = new ast.Literal($text) } ;

ID: [a-zA-Z0-9_]+;
NUMBER: [+-]?[0-9]+([.][0-9]+)?;
STRING: '"' ('\\' . | ~["\r\n\\])* '"';
OPERATOR: [+\-*/%&|<>!:^=]+;
WS: [ \t\r\n]+ -> skip;
LC: '//' ~[\r\n]* -> skip;
BC: '/*' .*? '*/' -> skip;
