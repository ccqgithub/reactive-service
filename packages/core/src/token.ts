import Injector from './injector';
import { InjectionClass, InjectionGet } from './types';

export default class InjectionToken<V = any> {
  private _desc: string;
  factory?: ((injector: Injector) => V) | null;

  constructor(
    desc: string,
    options?: {
      factory: (inject: InjectionGet) => V;
    }
  ) {
    this._desc = desc;
    // provide a makeInjectable to class, so they can inherits parent injector
    if (options?.factory) {
      this.factory = (injector) => {
        const inject = (p: InjectionClass) => injector.get(p);
        return options.factory(inject);
      };
    }
  }

  toString(): string {
    return `InjectionToken: ${this._desc}`;
  }
}
