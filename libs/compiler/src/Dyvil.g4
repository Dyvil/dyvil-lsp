grammar Dyvil;

@parser::header {
import * as ast from '../ast';
import { makeRange, cleanDoc } from '../compiler';
import { CommonTokenStream } from 'antlr4ts';
}

file returns [ast.CompilationUnit cu]:
  (classes+=class)* EOF { $cu = new ast.CompilationUnit(this._input.sourceName, $classes.map(c => c.cn)); }
;

class returns [ast.Class cn]:
  DOC? 'class' ID {
    $cn = new ast.Class($ID.text!, [], [], [])
    $cn.location = makeRange($ID);
    $cn.doc = cleanDoc($DOC);
  }
  '{' (
  field { $cn.fields.push($field.fn) }
  | ctor { $cn.constructors.push($ctor.cn) }
  | method { $cn.methods.push($method.mn) }
  | completionID { $cn.completion = new ast.ClassCompletion($completionID.text!); $cn.completion.location = makeRange($completionID.start!, $completionID.stop!); }
  )* '}'
;
field returns [ast.Field fn]:
  DOC? 'var' ID {
    $fn = new ast.Field($ID.text!, undefined!, undefined);
    $fn.location = makeRange($ID);
    $fn.doc = cleanDoc($DOC);
  }
  ':' type
  ('=' expression { $fn.value = $expression.e })?
  ';'?
;
ctor returns [ast.Constructor cn]:
  DOC? init='init' '(' (parameters+=parameter ','?)* ')' blockStatement {
    $cn = new ast.Constructor($parameters.map(p => p.pn), $blockStatement.bs)
    $cn.location = makeRange($init);
    $cn.doc = cleanDoc($DOC);
  }
;
method returns [ast.Method mn]:
  DOC? 'func' ID '(' (parameters+=parameter ','?)* ')' ':' type blockStatement {
    $mn = new ast.Method($ID.text!, $parameters.map(p => p.pn), $type.tn, $blockStatement.bs)
    $mn.location = makeRange($ID);
    $mn.doc = cleanDoc($DOC);
  }
;
parameter returns [ast.Parameter pn]:
  DOC? ID ':' type {
    $pn = new ast.Parameter($ID.text!, $type.tn)
    $pn.location = makeRange($ID);
    $pn.doc = cleanDoc($DOC);
  }
;
variable returns [ast.Variable v]:
  'var' ID { $v = new ast.Variable($ID.text!, undefined, undefined!); }
  (':' type { $v.type = $type.tn })?
  '=' expression { $v.value = $expression.e; }
  { $v.location = makeRange($ID); }
;

type returns [ast.Type tn] @after { $tn.location = makeRange($start, $stop); }:
  primitiveType { $tn = new ast.PrimitiveType($primitiveType.text! as ast.PrimitiveName) }
  |
  completableID { $tn = new ast.ClassType($completableID.text!) }
;
primitiveType: 'int' | 'boolean' | 'string' | 'void';

statement returns [ast.AnyStatement s] @after { $s.location = makeRange($start, $stop); }:
  variable { $s = new ast.VarStatement($variable.v) }
  |
  completionID { $s = new ast.CompletionStatement($completionID.text!) }
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
blockStatement returns [ast.Block bs]:
  '{' (statements+=statement)* '}' {
    $bs = new ast.Block($statements.map(s => s.s));
    $bs.location = makeRange($start, $stop);
  }
;

whileStatement returns [ast.WhileStatement ws]:
  'while' expression blockStatement {
    $ws = new ast.WhileStatement($expression.e, $blockStatement.bs);
    $ws.location = makeRange($start, $stop);
  }
;

ifStatement returns [ast.IfStatement is]:
  'if' expression thenBlock=blockStatement { $is = new ast.IfStatement($expression.e, $thenBlock.bs); }
  (
    'else' elseBlock=blockStatement { $is.else = $elseBlock.bs; }
    | 'else' elseIfBlock=ifStatement { $is.else = $elseIfBlock.is; }
    | completion=COMPLETION_MARKER { $is.completion = true; }
  )?
  { $is.location = makeRange($start, $stop);}
;

expression returns [ast.Expression e]:
  object=expression '.' ID '(' (arguments+=expression ','?)* ')' { $e = new ast.MethodCall($object.e, $ID.text!, $arguments.map(a => a.e)); $e.location = makeRange($ID); }
  |
  object=expression '.' completableID { $e = new ast.PropertyAccess($object.e, $completableID.text!); $e.location = makeRange($completableID.start!, $completableID.stop!); }
  |
  lhs=expression OPERATOR rhs=expression { $e = new ast.BinaryOperation($lhs.e, $OPERATOR.text!, $rhs.e); $e.location = makeRange($OPERATOR); }
  |<assoc=right>
  lhs=expression op='=' rhs=expression { $e = new ast.BinaryOperation($lhs.e, '=', $rhs.e); $e.location = makeRange($op); }
  |
  ID '(' (arguments+=expression ','?)* ')' { $e = new ast.FunctionCall($ID.text!, $arguments.map(a => a.e)); $e.location = makeRange($ID); }
  |
  completableID { $e = new ast.VariableReference($completableID.text!); $e.location = makeRange($start, $stop); }
  |
  '(' expression ')' { $e = new ast.ParenthesizedExpression($expression.e); $e.location = makeRange($start, $stop); }
  |
  literal { $e = $literal.l }
;
literal returns [ast.Literal l]: (NUMBER | STRING | 'true' | 'false') { $l = new ast.Literal($text); $l.location = makeRange($start); } ;

completableID: ID COMPLETION_MARKER? | COMPLETION_MARKER;
completionID: ID? COMPLETION_MARKER;

WS: [ \t\r\n]+ -> skip;
LC: '//' ~[\r\n]* -> skip;
DOC: '/**' .*? '*/';
BC: '/*' .*? '*/' -> skip;

NUMBER: [+-]?[0-9]+([.][0-9]+)?;
ID: [a-zA-Z0-9_]+;
STRING: '"' ('\\' . | ~["\r\n\\])* '"';
OPERATOR: [+\-*/%&|<>!:^=]+;
COMPLETION_MARKER: '§';
