import {ErrorExpression, Expression} from './expressions';
import {autocomplete, CompletionItem, Diagnostic, report} from '../lint';
import {autoIndent, CommentAware, Concept, Node, ParserMethod, StringFormat} from './node';
import {Name, Scope, SimpleScope} from '../scope';
import {Block} from './statements';
import {Type, ClassType, isAssignable, ErrorType} from './types';

export class CompilationUnit extends Node<'unit'> {
  static enclosing = Symbol('enclosing compilation unit');
  static parser: ParserMethod = 'file';

  diagnostics: Diagnostic[] = [];

  constructor(
    public path: string,
    public classes: Class[] = [],
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

  lint(scope: Scope) {
    super.lint(new SimpleScope({[CompilationUnit.enclosing]: this}, scope));
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    return this.classes.map(c => c.toString(format)).join('\n\n');
  }
}

export class Declaration<K extends string> extends Node<K> {
  _references: Node<any>[] = [];
  doc?: string;

  constructor(
    kind: K,
    public name: string,
  ) {
    super(kind);
  }

  docComment(): string {
    if (!this.doc) {
      return '';
    }
    return '/**\n' + this.doc.trim().replace(/^/gm, ' * ') + '\n */\n';
  }

  documentation(): string | undefined {
    return this.doc;
  }

  references(): Node<string>[] {
    return [this, ...this._references];
  }
}

export class Class extends Declaration<'class'> implements Scope {
  static enclosing = Symbol('enclosing class');
  static parser: ParserMethod = 'class';

  completion?: ClassCompletion;

  constructor(
    name: string = '<anonymous>',
    public fields: Field[] = [],
    public constructors: Constructor[] = [],
    public methods: Method[] = [],
  ) {
    super('class', name);
  }

  asType(): ClassType {
    const classType = new ClassType(this.name);
    classType._class = this;
    classType.location = this.location;
    return classType;
  }

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: 'class',
    };
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    return autoIndent`
    ${this.docComment()}\
    class ${this.name} {
      ${this.fields.map(field => field.toString(format)).join('\n')}

      ${this.constructors.map(ctor => ctor.toString(format)).join('\n\n')}

      ${this.methods.map(method => method.toString(format)).join('\n\n')}
    }`;
  }

  lookup<N extends Node<any>>(name: Name, concept: Concept<N>, ...args: any[]): N | undefined {
    for (const field of this.fields) {
      if (field.name === name && field instanceof concept) {
        return field as N;
      }
    }
    for (const declaration of this.methods) {
      if (declaration.name === name && declaration instanceof concept && declaration.overloads(args[0])) {
        return declaration as N;
      }
    }
    for (const ctor of this.constructors) {
      if (ctor instanceof concept && ctor.overloads(args[0])) {
        return ctor as N;
      }
    }
  }

  list(): Node<any>[] {
    return [...this.fields, ...this.methods];
  }

  resolve(scope: Scope): this {
    const newScope = new SimpleScope({[Class.enclosing]: this}, scope);
    super.resolve(newScope);
    for (const field of this.fields) {
      if (this.fields.some(f => f !== field && f.name === field.name)) {
        report(scope, field.location!, `duplicate field ${field.name}`);
      }
    }
    for (const method of this.methods) {
      if (this.methods.some(m => m !== method && m.jsName === method.jsName)) {
        report(scope, method.location!, `duplicate method ${method.name} with mangled name ${method.jsName}`);
      }
    }

    return this;
  }
}

export class MethodLike<K extends string> extends Declaration<K> {
  _thisClass?: Class;
  _thisParameter?: Parameter;

  constructor(
    kind: K,
    name: string,
    public parameters: Parameter[],
    public body: Block,
  ) {
    super(kind, name);
  }

  resolve(scope: Scope): this {
    this._thisClass ||= scope.lookup(Class.enclosing, Class);
    if (this._thisClass && !this._thisParameter) {
      this._thisParameter = new Parameter('this', this._thisClass.asType());
      this._thisParameter.location = this.location;
    }
    const newScope = new SimpleScope(this._thisParameter ? [this._thisParameter, ...this.parameters] : this.parameters, scope);
    return super.resolve(newScope);
  }

  overloads(args: Type[]) {
    return args.length === this.parameters.length && this.parameters.every((param, i) => isAssignable(param.type, args[i]));
  }
}

export class Constructor extends MethodLike<'constructor'> {
  static completion: CompletionItem = {
    kind: 'keyword',
    label: 'init',
    snippet: 'init(\${1:parameters...}) {\n  \${2:statements...}\n}',
  };
  static parser: ParserMethod = 'ctor';

  constructor(
    parameters: Parameter[] = [],
    body: Block = new Block(),
  ) {
    super('constructor', 'init', parameters, body);
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    const keyword = format === 'js' ? 'constructor' : 'init';
    const params = this.parameters.map(param => param.toString(format)).join(', ');
    const body = this.body.toString(format);
    return `${this.docComment()}${keyword}(${params}) ${body}`;
  }

  documentation(): string | undefined {
    return this.parameters.length ? autoIndent`
    ${this.doc}

    #### Parameters
    ${this.parameters.map(param => '- ' + param.documentation()).join('\n')}
    ` : this.doc;
  }

  references(purpose?: 'rename' | 'definition'): Node<string>[] {
    return purpose === 'rename' ? [] : super.references();
  }
}

export class Field extends Declaration<'field'> {
  static completion: CompletionItem = {
    kind: 'keyword',
    label: 'var',
    snippet: 'var \${1:name}: \${2:type} = \${3:value}',
  };
  static parser: ParserMethod = 'field';

  constructor(
    name: string = '<unknown>',
    public type: Type = ErrorType,
    public value?: Expression,
  ) {
    super('field', name);
  }

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: 'field',
      signature: ': ' + this.type.toString(),
    };
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    const value = this.value ? ' = ' + this.value.toString(format) : '';
    if (format === 'js') {
      return autoIndent`
      _${this.name}${value};
      get ${this.name}() { return this._${this.name}; }
      set ${this.name}(value) { this._${this.name} = value; }`;
    }
    const type = this.type.toString(format);
    return `${this.docComment()}var ${this.name}: ${type}${value}`;
  }
}

export class Method extends MethodLike<'method'> {
  static completion: CompletionItem = {
    kind: 'keyword',
    label: 'func',
    snippet: 'func \${1:name}(\${2:parameters...}) {\n  \${3:statements...}\n}',
  };
  static parser: ParserMethod = 'method';

  constructor(
    name: string = '<unknown>',
    parameters: Parameter[] = [],
    public returnType: Type = ErrorType,
    body: Block = new Block(),
  ) {
    super('method', name, parameters, body);
  }

  get jsName() {
    return this.name + this.parameters.map(param => '_' + param.name).join('');
  }

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: 'method',
      signature: `(${this.parameters.map(param => param.type.toString()).join(', ')})${this.returnType ? ': ' + this.returnType.toString() : ''}`,
      snippet: `${this.name}(${this.parameters.map((p, i) => `$\{${i}:${p.name}}`).join(', ')})`,
    };
  }

  documentation(): string | undefined {
    let doc = this.doc || '';
    if (this.parameters.length) {
      doc += '\n#### Parameters\n' + this.parameters.map(param => '- ' + param.documentation()).join('\n');
    }
    if (this.returnType.kind !== 'type:primitive' || this.returnType.name !== 'void') {
      doc += '\n#### Returns\n`' + this.returnType.toString() + '`';
    }
    return doc;
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    const name = format !== 'js' ? 'func ' + this.name : this.jsName;
    const params = this.parameters.map(param => param.toString(format)).join(', ');
    const returnType = format !== 'js' ? ': ' + this.returnType.toString(format) : '';
    const body = this.body.toString(format);
    return `${this.docComment()}${name}(${params})${returnType} ${body}`;
  }
}

export class ClassCompletion extends Node<'class-completion'> {
  static completions = [
    Method,
    Constructor,
    Field,
  ].map(c => c.completion);

  constructor(
    public name: string,
  ) {
    super('class-completion');
  }

  toString(format?: StringFormat): string {
    return this.name;
  }

  resolve(scope: Scope): this {
    autocomplete(scope, this.location!, this.name, {
      extra: ClassCompletion.completions,
    })
    return super.resolve(scope);
  }
}

export class VariableLike<K extends string> extends Declaration<K> {
  constructor(
    kind: K,
    name: string,
    public type: Type | undefined,
  ) {
    super(kind, name);
  }

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: this.kind,
      signature: this.type ? ': ' + this.type.toString() : undefined,
    };
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    const type = this.type ? ': ' + this.type.toString(format) : '';
    return `${this.docComment()}${this.name}${type}`;
  }
}

export class Parameter extends VariableLike<'parameter'> {
  constructor(
    name: string = '<unknown>',
    public type: Type = ErrorType,
  ) {
    super('parameter', name, type);
  }
  static parser: ParserMethod = 'parameter';

  references(purpose?: 'rename' | 'definition'): Node<string>[] {
    return purpose === 'rename' && this.name === 'this' ? [] : super.references();
  }

  documentation(): string | undefined {
    return `\`${this.name}: ${this.type.toString()}\`${this.doc ? '\n' + this.doc : ''}`;
  }

  toString(format?: StringFormat): string {
    if (format === 'js') {
      return this.name;
    }
    return super.toString(format);
  }
}

export class Variable extends VariableLike<'variable'> {
  constructor(
    name: string = '<unknown>',
    type?: Type,
    public value: Expression = ErrorExpression,
  ) {
    super('variable', name, type);
  }
  static parser: ParserMethod = 'variable';

  documentation(): string | undefined {
    return `\`var ${this.name}: ${this.type?.toString()}\`${this.doc ? '\n' + this.doc : ''}`;
  }

  @CommentAware()
  toString(format?: StringFormat): string {
    if (format === 'js') {
      return `let ${this.name} = ${this.value.toString(format)}`;
    }
    const type = this.type && this.type.location ? ': ' + this.type.toString(format) : '';
    return `${this.docComment()}var ${this.name}${type} = ${this.value.toString(format)}`;
  }

  resolve(scope: Scope): this {
    const it = super.resolve(scope);
    it.type ||= it.value.getType();
    return it;
  }
}
