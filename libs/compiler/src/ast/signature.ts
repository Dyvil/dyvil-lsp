import {CompilationUnit} from "@stc/compiler";
import {createHash} from 'crypto';

export class SignatureBuilder {
  #dependencies = new Set<CompilationUnit>;
  #signature = '';
  #hash = createHash('sha1');

  addSignature(signature: string) {
    this.#signature += signature;
    this.#hash.update(signature);
  }

  addDependency(dep: CompilationUnit) {
    this.#dependencies.add(dep);
  }

  get dependencies(): Set<CompilationUnit> {
    return this.#dependencies;
  }

  get signature(): string {
    return this.#signature;
  }

  get hash(): string {
    return this.#hash.digest('hex');
  }
}
