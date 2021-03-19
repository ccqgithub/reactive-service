import { reactive } from 'vue';
import { Observable } from 'rxjs';
import {
  Disposable,
  Injector,
  InjectorProvide,
  InjectorProvider
} from '@reactive-service/core';

type Reactive = ReturnType<typeof reactive>;

export default class Service<
  S extends Record<string, unknown>
> extends Disposable {
  private $_injector: Injector;

  state: Reactive;

  constructor(initialState: S, providers: InjectorProvider[]) {
    super();
    this.state = reactive(initialState);
    // provide services
    this.$_injector = new Injector(providers, Injector.getParentInjector(this));
    this.beforeDispose(() => {
      this.$_injector.dispose();
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
