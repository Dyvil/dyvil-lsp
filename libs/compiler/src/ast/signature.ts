import {CompilationUnit} from "@stc/compiler";
import {enc, SHA1} from 'crypto-js';

export class SignatureBuilder {
  #dependencies = new Set<string>;
  #signature = '';

  addSignature(signature: string) {
    this.#signature += signature;
  }

  addDependency(dep: CompilationUnit) {
    this.#dependencies.add(dep.path);
  }

  build(): Signature {
    return {
      dependencies: this.#dependencies,
      signature: this.#signature,
      hash: SHA1(this.#signature).toString(enc.Base64),
    };
  }
}

export interface Signature {
  dependencies: Set<string>;
  signature: string;
  hash: string;
}
