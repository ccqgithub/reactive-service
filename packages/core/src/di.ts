import Injector from './injector';
import { InjectionProvide, InjectionProvider, InjectionValue } from './types';

export default class DINode {
  parentInjector: Injector | null;
  injector: Injector;

  constructor(parentInjector: Injector | null = null) {
    this.parentInjector = parentInjector;
    this.injector = new Injector([], this.parentInjector);
  }

  inject = <P extends InjectionProvide>(provide: P): InjectionValue<P> => {
    return this.injector.get(provide);
  };

  provide = (providers: InjectionProvider[]): void => {
    this.injector = new Injector(providers, this.parentInjector);
  };

  dispose = (): void => {
    this.injector.dispose();
  };
}
