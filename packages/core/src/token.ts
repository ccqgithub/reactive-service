import Injector from './injector';
import DINode from './di';

export default class InjectionToken<V = any> {
  private _desc: string;
  factory?: ((injector: Injector) => V) | null;

  constructor(desc: string, options?: { factory: (di: () => DINode) => V }) {
    this._desc = desc;
    // provide a makeInjectable to class, so they can inherits parent injector
    if (options?.factory) {
      this.factory = (injector) => {
        const di = () => new DINode(injector);
        return options.factory(di);
      };
    }
  }

  toString(): string {
    return `InjectionToken: ${this._desc}`;
  }
}
