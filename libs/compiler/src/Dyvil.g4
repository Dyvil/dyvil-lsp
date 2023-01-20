grammar Dyvil;

@header {
import * as ast from '../ast';
import {PrimitiveName} from '../ast';
}

file: class;

class returns [ast.Class cn]:
  'class' name=ID '{' (fields+=field | constructors+=ctor | methods+=method)* '}'
  { $cn = new ast.Class($name.text, $fields.map(f => f.fn), $constructors.map(c => c.cn), $methods.map(m => m.mn)) }
;
field returns [ast.Field fn]:
  'var' name=ID ':' type ('=' expression)? ';'?
  { $fn = new ast.Field($name.text, $type.tn, $expression.e) }
;
ctor returns [ast.Constructor cn]:
  'init' '(' (parameters+=parameter ','?)* ')' blockStatement
  { $cn = new ast.Constructor($parameters.map(p => p.pn), $blockStatement.bs) }
;
method returns [ast.Method mn]:
  'func' name=ID '(' (parameters+=parameter ','?)* ')' ':' type blockStatement
  { $mn = new ast.Method($name.text, $parameters.map(p => p.pn), $type.tn, $blockStatement.bs) }
;
parameter returns [ast.Parameter pn]:
  name=ID ':' type
  { $pn = new ast.Parameter($name.text, $type.tn) }
;
variable returns [ast.Variable v]:
  'var' name=ID ':' type '=' expression { $v = new ast.Variable($name.text, $type.tn, $expression.e) }
;

type returns [ast.AnyType tn]:
  primitiveType { $tn = new ast.PrimitiveType($primitiveType.text as PrimitiveName) }
  |
  className=ID { $tn = new ast.ClassType($className.text) }
;
primitiveType: 'int' | 'boolean' | 'string' | 'void';

statement returns [ast.AnyStatement s]:
  variable { $s = new ast.VarStatement($variable.v) }
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
