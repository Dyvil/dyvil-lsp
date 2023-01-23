grammar Dyvil;

@parser::header {
import * as ast from '../ast';
import { makeRange } from '../compiler';
}

file returns [ast.CompilationUnit cu]:
  (classes+=class)* EOF { $cu = new ast.CompilationUnit(this._input.sourceName, $classes.map(c => c.cn)); }
;

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
  'var' ID (':' types+=type)? '=' expression { $v = new ast.Variable($ID.text!, $types[0]?.tn, $expression.e) }
;

type returns [ast.AnyType tn] @after { $tn.location = makeRange($start, $stop); }:
  primitiveType { $tn = new ast.PrimitiveType($primitiveType.text! as ast.PrimitiveName) }
  |
  completableID { $tn = new ast.ClassType($completableID.text!) }
;
primitiveType: 'int' | 'boolean' | 'string' | 'void';

statement returns [ast.AnyStatement s] @after { $s.location = makeRange($start, $stop); }:
  variable { $s = new ast.VarStatement($variable.v) }
  |
  COMPLETION_MARKER { $s = new ast.CompletionStatement() }
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
  object=expression '.' ID '(' (arguments+=expression)* ')' { $e = new ast.MethodCall($object.e, $ID.text!, $arguments.map(a => a.e)); $e.location = makeRange($ID); }
  |
  object=expression '.' completableID { $e = new ast.PropertyAccess($object.e, $completableID.text!); $e.location = makeRange($completableID.start!, $completableID.stop!); }
  |
  lhs=expression OPERATOR rhs=expression { $e = new ast.BinaryOperation($lhs.e, $OPERATOR.text!, $rhs.e); $e.location = makeRange($OPERATOR); }
  |<assoc=right>
  lhs=expression op='=' rhs=expression { $e = new ast.BinaryOperation($lhs.e, '=', $rhs.e); $e.location = makeRange($op); }
  |
  ID '(' (arguments+=expression)* ')' { $e = new ast.FunctionCall($ID.text!, $arguments.map(a => a.e)); $e.location = makeRange($ID); }
  |
  completableID { $e = new ast.VariableReference($completableID.text!); $e.location = makeRange($start, $stop); }
  |
  '(' expression ')' { $e = new ast.ParenthesizedExpression($expression.e); $e.location = makeRange($start, $stop); }
  |
  literal { $e = $literal.l }
;
literal returns [ast.Literal l]: (NUMBER | STRING | 'true' | 'false') { $l = new ast.Literal($text); $l.location = makeRange($start); } ;

completableID:
  ID COMPLETION_MARKER?
  |
  COMPLETION_MARKER
;

WS: [ \t\r\n]+ -> skip;
LC: '//' ~[\r\n]* -> skip;
BC: '/*' .*? '*/' -> skip;

NUMBER: [+-]?[0-9]+([.][0-9]+)?;
ID: [a-zA-Z0-9_]+;
STRING: '"' ('\\' . | ~["\r\n\\])* '"';
OPERATOR: [+\-*/%&|<>!:^=]+;
COMPLETION_MARKER: '§';
