grammar Dyvil;

file: class;

class: 'class' name=ID '{' (field | method)* '}';
field: 'var' name=ID ';';
method: 'func' name=ID '(' (parameters+=parameter ','?)* ')' '{'  '}';
parameter: name=ID ':' type;

type: 'int' | 'boolean' | 'string' | 'void' | name=ID;

ID: [a-zA-Z0-9_]+;
