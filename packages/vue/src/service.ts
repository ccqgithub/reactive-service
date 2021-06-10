import { reactive, readonly } from 'vue';
import { UnwrapNestedRefs } from '@vue/reactivity';
import { Observable, Subject, PartialObserver } from 'rxjs';
import { Disposable, debug, InjectionClass } from '@reactive-service/core';

export type ServiceActions<A extends Record<string, any>> = {
  [P in keyof A]: Subject<A[P]>;
};
export type ServiceEvents<E extends Record<string, any>> = {
  [P in keyof E]: Subject<E[P]>;
};
export type ServiceOptions<
  S extends Record<string, any>,
  A extends Record<string, any>,
  E extends Record<string, any>
> = {
  state?: S;
  actions?: (keyof A)[];
  events?: (keyof E)[];
};

// Service 服务基类
/* 
type State = {
  user: User | null;
}
type Actions = {
  login: LoginParams;
  logout: undefined;
};
type Events = {
  message: any;
}
class AppService extends Service<State, Actions, Events> {
  constructor() {
    super({
      state: {
        user: null
      },
      actions: ['login', 'logout'],
      events: ['message']
    })

    // listen actions
    this.subscribe(
      this.$a.login.pipe(
        map(v => v)
      ),
      {
        next: () => {},
        error: () => {}
      }
    )

    // send notifies
    this.$e.message.next('init');
  }
} 
*/
export default class Service<
    S extends Record<string, any> = {},
    A extends Record<string, any> = {},
    E extends Record<string, any> = {}
  >
  extends Disposable
  implements InjectionClass
{
  // displayName, for debug
  displayName = '';
  // actions
  $: ServiceActions<A> = {} as ServiceActions<A>;
  // notifies
  $e: ServiceEvents<E> = {} as ServiceEvents<E>;
  // state
  _state;
  state;

  constructor(args: ServiceOptions<S, A, E> = {}) {
    super();

    // init state
    const _state = reactive<S>(args.state || ({} as S));
    const state = readonly(_state);
    this._state = _state;
    this.state = state;
    // init actions
    const actions = args.actions || [];
    actions.forEach((key) => {
      this.$[key] = new Subject<A[typeof key]>();
    });
    // init events
    const events = args.events || [];
    events.forEach((key) => {
      this.$e[key] = new Subject<E[typeof key]>();
    });

    // debug
    // debugs: new action
    Object.keys(this.$).forEach((key) => {
      this.subscribe(this.$[key], {
        next: (v: any) => {
          debug(
            `[Service ${this.displayName}]: receive new action [${key}].`,
            'info'
          );
          debug(v, 'info');
        }
      });
    });
    // debugs: new event
    Object.keys(this.$e).forEach((key) => {
      this.subscribe(this.$e[key], {
        next: (v: any) => {
          debug(
            `[Service ${this.displayName}]: emit new event [${key}].`,
            'info'
          );
          debug(v, 'info');
        }
      });
    });
  }

  setState(fn: (state: UnwrapNestedRefs<S>) => void) {
    fn(this._state);
  }

  subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void;
  /** @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in v1 because rxjs v8 do it. Details: https://rxjs.dev/deprecations/subscribe-arguments */
  subscribe<T = any>(
    ob: Observable<T>,
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): void;
  subscribe<T = any>(ob: Observable<T>, ...args: any[]): void {
    const subscription = ob.subscribe(...args);
    this.beforeDispose(() => {
      subscription.unsubscribe();
    });
  }
}
