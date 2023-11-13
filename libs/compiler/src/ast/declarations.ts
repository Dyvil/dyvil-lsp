import {Expression} from './expressions';
import {autocomplete, CompletionItem, Diagnostic, Range, report} from './lint';
import {autoIndent, Node, StringFormat} from './node';
import {Ctor, Name, Scope, SimpleScope} from './scope';
import {Block} from './statements';
import {Type, ClassType, isAssignable} from './types';

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

export class Declaration<K extends string> extends Node<K> {
  _references: Node<any>[] = [];
  doc?: string;

  constructor(
    kind: K,
    public name: string,
  ) {
    super(kind);
  }

  documentation(): string | undefined {
    return this.doc;
  }

  references(): Range[] {
    return [this.location!, ...this._references.map(ref => ref.location!)];
  }
}

export class Class extends Declaration<'class'> implements Scope {
  static enclosing = Symbol('enclosing class');

  completion?: ClassCompletion;

  constructor(
    name: string,
    public fields: Field[] = [],
    public constructors: Constructor[] = [],
    public methods: Method[] = [],
  ) {
    super('class', name);
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

  toString(format?: StringFormat): string {
    return autoIndent`
    class ${this.name} {
      ${this.fields.map(field => field.toString(format)).join('\n')}

      ${this.constructors.map(field => field.toString(format)).join('\n\n')}

      ${this.methods.map(method => method.toString(format)).join('\n\n')}
    }`;
  }

  lookup<N extends Node<any>>(name: Name, kind: Ctor<N>, ...args: any[]): N | undefined {
    for (const field of this.fields) {
      if (field.name === name && field instanceof kind) {
        return field as N;
      }
    }
    for (const declaration of this.methods) {
      if (declaration.name === name && declaration instanceof kind && declaration.overloads(args[0])) {
        return declaration as N;
      }
    }
    for (const ctor of this.constructors) {
      if (ctor instanceof kind && ctor.overloads(args[0])) {
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

export class ClassCompletion extends Node<'class-completion'> {
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
      extra: CompletableClassDeclarations.map(statement => ({
        kind: 'keyword',
        label: statement.keyword,
        snippet: statement.snippet,
      })),
    })
    return super.resolve(scope);
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
  static keyword = 'init';
  static snippet = `init(\${1:parameters...}) {
  \${2:statements...}
}`;

  constructor(
    parameters: Parameter[] = [],
    body: Block,
  ) {
    super('constructor', 'init', parameters, body);
  }

  toString(format?: StringFormat): string {
    return `${format === 'js' ? 'constructor' : 'init'}(${this.parameters.map(param => param.toString(format)).join(', ')}) ${this.body.toString(format)}`;
  }

  documentation(): string | undefined {
    return this.parameters.length ? autoIndent`
    ${this.doc}

    #### Parameters
    ${this.parameters.map(param => '- ' + param.documentation()).join('\n')}
    ` : this.doc;
  }

  references(purpose?: 'rename' | 'definition'): Range[] {
    return purpose === 'rename' ? [] : super.references();
  }
}

export class Field extends Declaration<'field'> {
  static keyword = 'var';
  static snippet = 'var ${1:name}: ${2:type} = ${3:value}';

  constructor(
    name: string,
    public type: Type,
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

export class Method extends MethodLike<'method'> {
  static keyword = 'func';
  static snippet = `func \${1:name}(\${2:parameters...}) {
  \${3:statements...}
}`;

  constructor(
    name: string,
    parameters: Parameter[] = [],
    public returnType: Type,
    body: Block,
  ) {
    super('method', name, parameters, body);
  }

  get jsName() {
    return this.name + this.parameters.map(param => '_' + param.name).join('');
  }

  asCompletion(): CompletionItem {
    return {
      label: this.name,
      kind: 'field',
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

  toString(format?: StringFormat): string {
    return `${format !== 'js' ? 'func ' + this.name : this.jsName}(${this.parameters.map(param => param.toString(format)).join(', ')})${format !== 'js' ? ': ' + this.returnType.toString(format) : ''} ${this.body.toString(format)}`;
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

  toString(format?: StringFormat): string {
    return `${this.name}${this.type ? ': ' + this.type.toString(format) : ''}`;
  }
}

export class Parameter extends VariableLike<'parameter'> {
  type!: Type;

  constructor(
    name: string,
    type: Type,
  ) {
    super('parameter', name, type);
  }

  references(purpose?: 'rename' | 'definition'): Range[] {
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
    name: string,
    type: Type | undefined,
    public value: Expression,
  ) {
    super('variable', name, type);
  }

  documentation(): string | undefined {
    return `\`var ${this.name}: ${this.type?.toString()}\`${this.doc ? '\n' + this.doc : ''}`;
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

export const CompletableClassDeclarations = [
  Method,
  Constructor,
  Field,
] as const;
