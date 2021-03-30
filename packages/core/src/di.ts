import Injector from './injector';
import { InjectionProvide, InjectionProvider } from './types';

export default class DI {
  parent: Injector | null;
  injector: Injector;

  constructor(parent: Injector | null = null) {
    this.parent = parent;
    this.injector = new Injector([], this.parent);
  }

  inject = (provide: InjectionProvide) => {
    return this.injector.get(provide);
  };

  provide = (providers: InjectionProvider[]) => {
    this.injector = new Injector(providers, this.parent);
  };
}
