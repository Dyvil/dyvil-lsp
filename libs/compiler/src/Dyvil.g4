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
  'var' name=ID ':' type ';'?
  { $fn = new ast.FieldNode($name.text, $type.tn) }
;
ctor returns [ast.ConstructorNode cn]:
  'init' '(' (parameters+=parameter ','?)* ')' '{'  '}'
  { $cn = new ast.ConstructorNode($parameters.map(p => p.pn)) }
;
method returns [ast.MethodNode mn]:
  'func' name=ID '(' (parameters+=parameter ','?)* ')' ':' type '{'  '}'
  { $mn = new ast.MethodNode($name.text, $parameters.map(p => p.pn), $type.tn) }
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

ID: [a-zA-Z0-9_]+;
WS: [ \t\r\n]+ -> skip;
LC: '//' ~[\r\n]* -> skip;
BC: '/*' .*? '*/' -> skip;
