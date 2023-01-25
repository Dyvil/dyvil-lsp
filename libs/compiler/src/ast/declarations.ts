import {AnyExpression} from './expressions';
import {CompletionItem, Diagnostic, Range} from './lint';
import {autoIndent, Node, StringFormat} from './node';
import {Ctor, Name, Scope, SimpleScope} from './scope';
import {Block} from './statements';
import {AnyType, ClassType, isAssignable} from './types';

export class CompilationUnit extends Node<'unit'> {
  static enclosing = Symbol('enclosing compilation unit');

  diagnostics: Diagnostic[] = [];

  constructor(
    public path: string,
    public classes: Class[],
  ) {
    super('unit');
  }

  report(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
  }

  resolve(scope: Scope): this {
    const decls: Record<Name, Class | CompilationUnit> = {[CompilationUnit.enclosing]: this};
    for (const cls of this.classes) {
      decls[cls.name] = cls;
    }
    return super.resolve(new SimpleScope(decls, scope));
  }

  toString(format?: StringFormat): string {
    return this.classes.map(c => c.toString(format)).join('\n\n');
  }
}

export class Class extends Node<'class'> implements Scope {
  static enclosing = Symbol('enclosing class');

  _references: Node<any>[] = [];

  constructor(
    public name: string,
    public fields: Field[] = [],
    public constructors: Constructor[] = [],
    public methods: Method[] = [],
  ) {
    super('class');
  }

  asType(): ClassType {
    const classType = new ClassType(this.name);
    classType._class = this;
    return classType;
  }

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: 'class',
    };
  }

  references(): Range[] {
    return [this.location!, ...this._references.map(ref => ref.location!)];
  }

  findConstructor(types: AnyType[]): Constructor | undefined {
    return this.constructors.find(ctor => ctor.parameters.length === types.length && ctor.parameters.every((param, i) => isAssignable(param.type, types[i])));
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

  list(): Node<any>[] {
    return [...this.fields, ...this.methods];
  }

  resolve(scope: Scope): this {
    const newScope = new SimpleScope({[Class.enclosing]: this}, scope);
    return super.resolve(newScope);
  }
}

export class Constructor extends Node<'constructor'> {
  _thisClass?: Class;
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
    this._thisClass ||= scope.lookup(Class.enclosing, Class);
    this._thisParameter ||= this._thisClass && new Parameter('this', this._thisClass.asType());
    const newScope = new SimpleScope(this._thisParameter ? [this._thisParameter, ...this.parameters] : this.parameters, scope);
    return super.resolve(newScope);
  }
}

export class Field extends Node<'field'> {
  _references: Node<any>[] = [];

  constructor(
    public name: string,
    public type: AnyType,
    public value?: AnyExpression,
  ) {
    super('field');
  }

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: 'field',
      signature: ': ' + this.type.toString(),
    };
  }

  references(): Range[] {
    return [this.location!, ...this._references.map(ref => ref.location!)];
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
  _thisClass?: Class;
  _thisParameter?: Parameter;
  _references: Node<any>[] = [];

  constructor(
    public name: string,
    public parameters: Parameter[] = [],
    public returnType: AnyType,
    public body: Block,
  ) {
    super('method');
  }

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: 'field',
      signature: `(${this.parameters.map(param => param.type.toString()).join(', ')})${this.returnType ? ': ' + this.returnType.toString() : ''}`,
      snippet: `${this.name}(${this.parameters.map((p, i) => `$\{${i}:${p.name}}`).join(', ')})`,
    };
  }

  references(): Range[] {
    return [this.location!, ...this._references.map(ref => ref.location!)];
  }

  toString(format?: StringFormat): string {
    return `${format !== 'js' ? 'func ' : ''}${this.name}(${this.parameters.map(param => param.toString(format)).join(', ')})${format !== 'js' ? ': ' + this.returnType.toString(format) : ''} ${this.body.toString(format)}`;
  }

  resolve(scope: Scope): this {
    this._thisClass ||= scope.lookup(Class.enclosing, Class);
    this._thisParameter ||= this._thisClass && new Parameter('this', this._thisClass.asType());
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

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: 'variable',
      signature: this.type ? ': ' + this.type.toString() : undefined,
    };
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
