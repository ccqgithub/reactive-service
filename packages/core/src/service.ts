import { BehaviorSubject, Observable, Subject, PartialObserver } from 'rxjs';
import Disposable from './disposable';
import { debug } from './util';
import { InjectionClass } from './types';

export type ServiceState<S extends Record<string, any>> = {
  [P in keyof S]: BehaviorSubject<S[P]>;
};
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
  implements InjectionClass {
  // displayName, for debug
  displayName = '';
  // state
  $s: ServiceState<S> = {} as ServiceState<S>;
  // actions
  $a: ServiceActions<A> = {} as ServiceActions<A>;
  // notifies
  $e: ServiceEvents<E> = {} as ServiceEvents<E>;
  // state
  get state(): S {
    const state = {} as S;
    (Object.keys(this.$s) as (keyof S)[]).forEach((key) => {
      const source = this.$s[key];
      if (source instanceof BehaviorSubject) {
        state[key] = source.value;
      }
    });
    return state;
  }

  constructor(args: ServiceOptions<S, A, E> = {}) {
    super();

    // init state
    const initialState = (args.state || {}) as S;
    (Object.keys(initialState) as (keyof S)[]).forEach((key) => {
      this.$s[key] = new BehaviorSubject<S[typeof key]>(initialState[key]);
    });
    // init actions
    const actions = args.actions || [];
    actions.forEach((key) => {
      this.$a[key] = new Subject<A[typeof key]>();
    });
    // init events
    const events = args.events || [];
    events.forEach((key) => {
      this.$e[key] = new Subject<E[typeof key]>();
    });

    // debug
    // debugs: update state
    Object.keys(this.$s).forEach((key) => {
      this.subscribe(this.$s[key], {
        next: (v: any) => {
          debug(
            `[Service ${this.displayName}]: set new state [${key}].`,
            'info'
          );
          debug(v, 'info');
        }
      });
    });
    // debugs: new action
    Object.keys(this.$a).forEach((key) => {
      this.subscribe(this.$a[key], {
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
