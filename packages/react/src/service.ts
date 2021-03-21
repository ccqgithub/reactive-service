import { Observable } from 'rxjs';
import { observable, runInAction } from 'mobx';
import Injector from './injector';
import Disposable from './disposable';
import { InjectorProvide, InjectorProvider } from './types';

export type StateData = Record<string, any>;

export type SetState<S> = (state: S) => void;

// Service 服务基类
export default class Service<
  S extends StateData = StateData
> extends Disposable {
  private $_injector: Injector;

  state: S;

  constructor(initialState: S, providers: InjectorProvider[] = []) {
    super();
    this.state = observable(initialState);
    // provide services
    this.$_injector = new Injector(providers, Injector.getParentInjector(this));
    this.beforeDispose(() => {
      this.$_injector.dispose();
    });
  }

  setState(fn: SetState<S>): void {
    runInAction(() => {
      fn(this.state);
    });
  }

  subscribe(ob$: Observable<any>, ...args: any[]): void {
    const subscription = ob$.subscribe(...args);
    this.beforeDispose(() => {
      subscription.unsubscribe();
    });
  }

  getService(provide: InjectorProvide): Record<string, any> {
    const injector = this.$_injector;
    return injector.get(provide);
  }
}
