import { InjectionGet } from './types';

export default class InjectionToken<V = any> {
  private _desc: string;
  factory?: ((inject: InjectionGet) => V) | null;

  constructor(
    desc: string,
    options?: {
      factory: (inject: InjectionGet) => V;
    }
  ) {
    this._desc = desc;
    this.factory = options?.factory;
  }

  toString(): string {
    return `InjectionToken: ${this._desc}`;
  }
}
