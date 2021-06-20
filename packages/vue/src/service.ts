import { reactive, readonly } from 'vue';
import { Observable, Subject, PartialObserver } from 'rxjs';
import { Disposable, debug, InjectionClass } from './core';

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
  data?: S;
  actions?: (keyof A)[];
  events?: (keyof E)[];
};

// Service 服务基类
/* 
type Data = {
  user: User | null;
}
type Actions = {
  login: LoginParams;
  logout: undefined;
};
type Events = {
  message: any;
}
class AppService extends Service<Data, Actions, Events> {
  constructor() {
    super({
      data: {
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
  $a: ServiceActions<A> = {} as ServiceActions<A>;
  // notifies
  $e: ServiceEvents<E> = {} as ServiceEvents<E>;
  // data
  private data;
  $d;

  constructor(args: ServiceOptions<S, A, E> = {}) {
    super();

    // init data
    const data = reactive<S>(args.data || ({} as S));
    const $d = readonly(data);
    this.data = data;
    this.$d = $d;
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

  subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void {
    const subscription = ob.subscribe(observer);
    this.beforeDispose(() => {
      subscription.unsubscribe();
    });
  }
}
