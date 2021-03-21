import { Observable } from 'rxjs';
import Injector from './injector';
import { InjectorProvide, InjectorProvider } from './types';
import State, { StateData } from './state';

// Service 服务基类
export default class Service<S extends StateData = StateData> extends State<S> {
  private $_injector: Injector;

  constructor(initialState: S, providers: InjectorProvider[] = []) {
    super(initialState);
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
