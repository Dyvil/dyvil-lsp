grammar Dyvil;

@parser::header {
import * as ast from '../ast';
import {PrimitiveName} from '../ast';

function makeRange(start: Token, stop?: Token) {
  return new ast.Range(
    new ast.Position(start.line, start.charPositionInLine),
    stop ? new ast.Position(stop.line, stop.charPositionInLine + (stop.text?.length || 0)) : new ast.Position(start.line, start.charPositionInLine + (start.text?.length || 0))
  );
}
}

file: class EOF;

class returns [ast.Class cn]:
  'class' ID '{' (fields+=field | constructors+=ctor | methods+=method)* '}'
  { $cn = new ast.Class($ID.text!, $fields.map(f => f.fn), $constructors.map(c => c.cn), $methods.map(m => m.mn)) }
;
field returns [ast.Field fn]:
  'var' ID ':' type ('=' expression)? ';'?
  { $fn = new ast.Field($ID.text!, $type.tn, $expression.e) }
;
ctor returns [ast.Constructor cn]:
  'init' '(' (parameters+=parameter ','?)* ')' blockStatement
  { $cn = new ast.Constructor($parameters.map(p => p.pn), $blockStatement.bs) }
;
method returns [ast.Method mn]:
  'func' ID '(' (parameters+=parameter ','?)* ')' ':' type blockStatement
  { $mn = new ast.Method($ID.text!, $parameters.map(p => p.pn), $type.tn, $blockStatement.bs) }
;
parameter returns [ast.Parameter pn]:
  ID ':' type
  { $pn = new ast.Parameter($ID.text!, $type.tn) }
;
variable returns [ast.Variable v]:
  'var' ID ':' type '=' expression { $v = new ast.Variable($ID.text!, $type.tn, $expression.e) }
;

type returns [ast.AnyType tn] @after { $tn.location = makeRange($start, $stop); }:
  primitiveType { $tn = new ast.PrimitiveType($primitiveType.text! as PrimitiveName) }
  |
  ID { $tn = new ast.ClassType($ID.text!) }
;
primitiveType: 'int' | 'boolean' | 'string' | 'void';

statement returns [ast.AnyStatement s] @after { $s.location = makeRange($start, $stop); }:
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

expression returns [ast.AnyExpression e] @after { $e.location = makeRange($start, $stop); }:
  object=expression '.' ID '(' (arguments+=expression)* ')' { $e = new ast.MethodCall($object.e, $ID.text!, $arguments.map(a => a.e)) }
  |
  object=expression '.' ID { $e = new ast.PropertyAccess($object.e, $ID.text!) }
  |
  lhs=expression OPERATOR rhs=expression { $e = new ast.BinaryOperation($lhs.e, $OPERATOR.text!, $rhs.e) }
  |<assoc=right>
  lhs=expression '=' rhs=expression { $e = new ast.BinaryOperation($lhs.e, '=', $rhs.e) }
  |
  ID '(' (arguments+=expression)* ')' { $e = new ast.FunctionCall($ID.text!, $arguments.map(a => a.e)) }
  |
  ID { $e = new ast.VariableReference($ID.text!) }
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
