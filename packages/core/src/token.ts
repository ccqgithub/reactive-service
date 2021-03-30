import Injector from './injector';
import { MakeInjectable, InjectionClass, Injectable } from './types';

export default class InjectionToken<V> {
  private _desc: string;
  factory?: ((injector: Injector) => V) | null;

  constructor(desc: string, options?: { factory: (mj: MakeInjectable) => V }) {
    this._desc = desc;
    // provide a makeInjectable to class, so they can inherits parent injector
    if (options?.factory) {
      this.factory = (injector) => {
        const makeInjectable: MakeInjectable = (cls) => {
          cls.prototype.$rs_getParentInjector = () => injector;
        };
        return options.factory(makeInjectable);
      };
    }
  }

  toString(): string {
    return `InjectionToken: ${this._desc}`;
  }
}
