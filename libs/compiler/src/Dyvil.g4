grammar Dyvil;

@parser::header {
import * as ast from '../ast';
import { makeRange, cleanDoc } from '../compiler';
import { CommonTokenStream } from 'antlr4ts';
}

file returns [ast.CompilationUnit cu]:
  { $cu = new ast.CompilationUnit(this._input.sourceName); }
  (class { $cu.classes.push($class.cn); })*
  EOF
;

class returns [ast.Class cn] @after { $cn.range = makeRange($start, $stop); }:
  DOC? 'class' ID {
    $cn = new ast.Class($ID.text)
    $cn.location = makeRange($ID);
    $cn.doc = cleanDoc($DOC);
  }
  '{' (
  field { $cn.fields.push($field.fn) }
  | ctor { $cn.constructors.push($ctor.cn) }
  | method { $cn.methods.push($method.mn) }
  | COMPLETION_ID { $cn.completion = new ast.ClassCompletion($COMPLETION_ID.text!); $cn.completion.location = makeRange($COMPLETION_ID); }
  )* '}'
;
field returns [ast.Field fn] @after { $fn.range = makeRange($start, $stop); }:
  DOC? 'var' ID {
    $fn = new ast.Field($ID.text);
    $fn.location = makeRange($ID);
    $fn.doc = cleanDoc($DOC);
  }
  ':' type { $fn.type = $type.tn; }
  ('=' expression { $fn.value = $expression.e })?
  ';'?
;
ctor returns [ast.Constructor cn] @after { $cn.range = makeRange($start, $stop); }:
  DOC? init='init' {
    $cn = new ast.Constructor();
    $cn.location = makeRange($init);
    $cn.doc = cleanDoc($DOC);
  }
  '(' parameterList { $cn.parameters = $parameterList.ps; } ')'
  blockStatement { $cn.body = $blockStatement.bs; }
;
method returns [ast.Method mn] @after { $mn.range = makeRange($start, $stop); }:
  DOC? 'func' ID {
    $mn = new ast.Method($ID.text);
    $mn.location = makeRange($ID);
    $mn.doc = cleanDoc($DOC);
  }
  '(' (parameterList { $mn.parameters = $parameterList.ps; })? ')'
  ':' type { $mn.returnType = $type.tn; }
  blockStatement { $mn.body = $blockStatement.bs; }
;
parameter returns [ast.Parameter pn] @after { $pn.range = makeRange($start, $stop); }:
  DOC? ID {
    $pn = new ast.Parameter($ID.text);
    $pn.location = makeRange($ID);
    $pn.doc = cleanDoc($DOC);
  }
  ':' type { $pn.type = $type.tn; }
;
parameterList returns [ast.Parameter[] ps] @init { $ps = []; }:
  parameter { $ps.push($parameter.pn); }
  (',' parameter { $ps.push($parameter.pn); })*
  ','?
;

variable returns [ast.Variable v] @after { $v.range = makeRange($start, $stop); }:
  'var' ID { $v = new ast.Variable($ID.text); }
  (':' type { $v.type = $type.tn })?
  '=' expression { $v.value = $expression.e; }
  { $v.location = makeRange($ID); }
;

type returns [ast.Type tn] @after { $tn.location = $tn.range = makeRange($start, $stop); }:
  primitiveType=('int' | 'boolean' | 'string' | 'void') { $tn = new ast.PrimitiveType($primitiveType.text! as ast.PrimitiveName) }
  |
  completableID { $tn = new ast.ClassType($completableID.text!) }
;

statement returns [ast.AnyStatement s] @after { $s.location = $s.range = makeRange($start, $stop); }:
  variable { $s = new ast.VarStatement($variable.v) }
  |
  COMPLETION_ID { $s = new ast.CompletionStatement($COMPLETION_ID.text!) }
  |
  expression { $s = new ast.ExpressionStatement($expression.e) }
  |
  blockStatement {$s = $blockStatement.bs }
  |
  whileStatement {$s = $whileStatement.ws}
  |
  ifStatement {$s = $ifStatement.is}
  |
  ';' { $s = ast.EmptyStatement }
;
blockStatement returns [ast.Block bs] @after { $bs.location = $bs.range = makeRange($start, $stop); }:
  '{' { $bs = new ast.Block(); }
  (statement { $bs.statements.push($statement.s); })*
  '}'
;

whileStatement returns [ast.WhileStatement ws] @after { $ws.range = makeRange($start, $stop); }:
  WHILE='while' { $ws = new ast.WhileStatement(); $ws.location = makeRange($WHILE); }
  expression { $ws.condition = $expression.e; }
  blockStatement { $ws.body = $blockStatement.bs; }
;

ifStatement returns [ast.IfStatement is] @after { $is.range = makeRange($start, $stop); }:
  IF='if' { $is = new ast.IfStatement(); $is.location = makeRange($IF); }
  expression { $is.condition = $expression.e; }
  thenBlock=blockStatement { $is.then = $thenBlock.bs; }
  (
    'else' elseBlock=blockStatement { $is.else = $elseBlock.bs; }
    | 'else' elseIfBlock=ifStatement { $is.else = $elseIfBlock.is; }
    | completion=COMPLETION_MARKER { $is.completion = true; }
  )?
;

expression returns [ast.Expression e] @after { $e.range = makeRange($start, $stop); }:
  receiver=expression '.' ID '(' { $e = new ast.MethodCall($receiver.e, $ID.text); $e.location = makeRange($ID); }
    (expressionList { ($e as ast.MethodCall).args = $expressionList.es; })?
    ')'
  |
  receiver=expression '.' completableID { $e = new ast.PropertyAccess($receiver.e, $completableID.text); $e.location = makeRange($completableID.start!, $completableID.stop!); }
  |
  lhs=expression OPERATOR rhs=expression { $e = new ast.BinaryOperation($lhs.e, $OPERATOR.text, $rhs.e); $e.location = makeRange($OPERATOR); }
  |<assoc=right>
  lhs=expression op='=' rhs=expression { $e = new ast.BinaryOperation($lhs.e, '=', $rhs.e); $e.location = makeRange($op); }
  |
  ID '(' { $e = new ast.FunctionCall($ID.text); $e.location = makeRange($ID); }
    (expressionList { ($e as ast.FunctionCall).args = $expressionList.es; })?
    ')'
  |
  completableID { $e = new ast.VariableReference($completableID.text); $e.location = makeRange($start, $stop); }
  |
  '(' expression ')' { $e = new ast.ParenthesizedExpression($expression.e); $e.location = makeRange($start, $stop); }
  |
  literal=(NUMBER | STRING | 'true' | 'false') { $e = new ast.Literal($literal.text!); $e.location = makeRange($literal); }
;
expressionList returns [ast.Expression[] es] @init { $es = []; }:
  expression { $es.push($expression.e); }
  (',' expression { $es.push($expression.e); })*
  ','?
;

completableID: ID | COMPLETION_ID;

WS: [ \t\r\n]+ -> skip;
LC: '//' ~[\r\n]* -> skip;
DOC: '/**' .*? '*/';
BC: '/*' .*? '*/' -> skip;

NUMBER: [+-]?[0-9]+([.][0-9]+)?;
COMPLETION_ID: ID? COMPLETION_MARKER;
ID: [a-zA-Z0-9_]+;
STRING: '"' ('\\' . | ~["\r\n\\])* '"';
OPERATOR: [+\-*/%&|<>!:^=]+;
COMPLETION_MARKER: '§';
