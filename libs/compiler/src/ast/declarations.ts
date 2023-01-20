import {AnyExpression} from './expressions';
import {log, Range, Severity} from './lint';
import {autoIndent, Node, StringFormat} from './node';
import {Ctor, Name, Scope, SimpleScope} from './scope';
import {Block} from './statements';
import {AnyType, ClassType} from './types';

export class CompilationUnit extends Node<'unit'> {
  static enclosing = Symbol('enclosing compilation unit');

  constructor(
    public path: string,
    public classes: Class[],
  ) {
    super('unit');
  }

  report(range: Range, problem: string, severity: Severity = 'error'): void {
    log(this.path, range, problem, severity);
  }

  toString(format?: StringFormat): string {
    return this.classes.join('\n\n');
  }
}

export class Class extends Node<'class'> implements Scope {
  static enclosing = Symbol('enclosing class');

  constructor(
    public name: string,
    public fields: Field[] = [],
    public constructors: Constructor[] = [],
    public methods: Method[] = [],
  ) {
    super('class');
  }

  toString(format?: StringFormat): string {
    return autoIndent`
    class ${this.name} {
      ${this.fields.map(field => field.toString(format)).join('\n')}

      ${this.constructors.map(field => field.toString(format)).join('\n\n')}

      ${this.methods.map(method => method.toString(format)).join('\n\n')}
    }`;
  }

  lookup<N extends Node<any>>(name: Name, kind: Ctor<N>): N | undefined {
    for (let declaration of [...this.fields, ...this.methods]) {
      if (declaration.name === name && declaration instanceof kind) {
        return declaration as N;
      }
    }
  }

  resolve(scope: Scope): this {
    const newScope = new SimpleScope({[Class.enclosing]: this}, scope);
    return super.resolve(newScope);
  }
}

export class Constructor extends Node<'constructor'> {
  _thisParameter?: Parameter;

  constructor(
    public parameters: Parameter[] = [],
    public body: Block,
  ) {
    super('constructor');
  }

  toString(format?: StringFormat): string {
    return `${format === 'js' ? 'constructor' : 'init'}(${this.parameters.map(param => param.toString(format)).join(', ')}) ${this.body.toString(format)}`;
  }

  resolve(scope: Scope): this {
    if (!this._thisParameter) {
      const enclosingClass = scope.lookup(Class.enclosing, Class);
      if (enclosingClass) {
        let classType = new ClassType(enclosingClass.name);
        classType._class = enclosingClass;
        this._thisParameter = new Parameter('this', classType);
      }
    }
    const newScope = new SimpleScope(this._thisParameter ? [this._thisParameter, ...this.parameters] : this.parameters, scope);
    return super.resolve(newScope);
  }
}

export class Field extends Node<'field'> {
  constructor(
    public name: string,
    public type: AnyType,
    public value?: AnyExpression,
  ) {
    super('field');
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return autoIndent`
      _${this.name}${this.value ? ' = ' + this.value.toString(format) : ''};

      get ${this.name}() {
        return this._${this.name};
      }

      set ${this.name}(value) {
        this._${this.name} = value;
      }`;
    }
    return `var ${this.name}: ${this.type.toString(format)}${this.value ? ' = ' + this.value.toString(format) : ''}`;
  }
}

export class Method extends Node<'method'> {
  _thisParameter?: Parameter;

  constructor(
    public name: string,
    public parameters: Parameter[] = [],
    public returnType: AnyType,
    public body: Block,
  ) {
    super('method');
  }

  toString(format?: StringFormat): string {
    return `${format !== 'js' ? 'func ' : ''}${this.name}(${this.parameters.map(param => param.toString(format)).join(', ')})${format !== 'js' ? ': ' + this.returnType.toString(format) : ''} ${this.body.toString(format)}`;
  }

  resolve(scope: Scope): this {
    if (!this._thisParameter) {
      const enclosingClass = scope.lookup(Class.enclosing, Class);
      if (enclosingClass) {
        let classType = new ClassType(enclosingClass.name);
        classType._class = enclosingClass;
        this._thisParameter = new Parameter('this', classType);
      }
    }
    const newScope = new SimpleScope(this._thisParameter ? [this._thisParameter, ...this.parameters] : this.parameters, scope);
    return super.resolve(newScope);
  }
}

export class Parameter extends Node<'parameter'> {
  constructor(
    public name: string,
    public type: AnyType,
  ) {
    super('parameter');
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return this.name;
    }
    return `${this.name}: ${this.type.toString(format)}`;
  }
}

export class Variable extends Node<'variable'> {
  constructor(
    public name: string,
    public type: AnyType | undefined,
    public value: AnyExpression,
  ) {
    super('variable');
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return `let ${this.name} = ${this.value.toString(format)}`;
    }
    return `var ${this.name}${this.type ? ': ' + this.type.toString(format) : ''} = ${this.value.toString(format)}`;
  }

  resolve(scope: Scope): this {
    const it = super.resolve(scope);
    it.type ||= it.value.getType();
    return it;
  }
}
