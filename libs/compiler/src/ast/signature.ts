import {CompilationUnit} from "@stc/compiler";
import {createHash} from 'crypto';

export class SignatureBuilder {
  #dependencies = new Set<string>;
  #signature = '';
  #hash = createHash('sha1');

  addSignature(signature: string) {
    this.#signature += signature;
    this.#hash.update(signature);
  }

  addDependency(dep: CompilationUnit) {
    this.#dependencies.add(dep.path);
  }

  build(): Signature {
    return {
      dependencies: this.#dependencies,
      signature: this.#signature,
      hash: this.#hash.digest('hex'),
    };
  }
}

export interface Signature {
  dependencies: Set<string>;
  signature: string;
  hash: string;
}
