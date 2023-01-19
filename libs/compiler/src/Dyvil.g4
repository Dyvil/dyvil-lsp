grammar Dyvil;

file: class;

class: 'class' name=ID '{' (field | ctor | method)* '}';
field: 'var' name=ID ':' type ';'?;
ctor: 'init' '(' (parameters+=parameter ','?)* ')' '{'  '}';
method: 'func' name=ID '(' (parameters+=parameter ','?)* ')' ':' returnType=type '{'  '}';
parameter: name=ID ':' type;

type: primitiveType | classType;
classType: name=ID;
primitiveType: 'int' | 'boolean' | 'string' | 'void';

ID: [a-zA-Z0-9_]+;
WS: [ \t\r\n]+ -> skip;
LC: '//' ~[\r\n]* -> skip;
BC: '/*' .*? '*/' -> skip;
