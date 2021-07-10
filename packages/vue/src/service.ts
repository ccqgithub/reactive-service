import { reactive, watch, App } from 'vue';
import { Observable, Subject, PartialObserver } from 'rxjs';
import { Disposable, debug, InjectionClass, InjectionContext } from './core';

const IS_DEV = process.env.NODE_ENV === 'development';

type Actions<A extends Record<string, any>> = {
  [P in keyof A]: Subject<A[P]>;
};

type Events<E extends Record<string, any>> = {
  [P in keyof E]: Subject<E[P]>;
};

type Mutation<S> = (state: S, payload: any) => void;

type Payload<M, K extends keyof M> = M[K] extends (
  state: any,
  p: infer P
) => any
  ? P
  : never;

type Options<
  S extends Record<string, any>,
  A extends Record<string, any>,
  E extends Record<string, any>,
  M extends Record<string, Mutation<S>>
> = {
  name?: string;
  strict?: boolean;
  state?: S;
  mutations?: M;
  actions?: (keyof A)[];
  events?: (keyof E)[];
  setup?: (ctx: {
    state: S;
    $actions: Actions<A>;
    $events: Events<E>;
    commit: (key: keyof M, payload: Payload<M, keyof M>) => void;
    subscribe: <T = any>(
      ob: Observable<T>,
      observer?: PartialObserver<T>
    ) => void;
    dispatch: <K extends keyof A>(key: K, v: A[K]) => void;
    emit: <K extends keyof E>(key: K, v: E[K]) => void;
    on: <K extends keyof E>(key: K, fn: (v: E[K]) => void) => void;
  }) => void;
};

export class Service<
    S extends Record<string, any> = {},
    A extends Record<string, any> = {},
    E extends Record<string, any> = {},
    M extends Record<string, Mutation<S>> = {}
  >
  extends Disposable
  implements InjectionClass
{
  private _vm: { state: S };
  private mutations: M = {} as M;
  private isCommitting = false;
  private app: App<Element>;

  name = '';
  $actions: Actions<A> = {} as Actions<A>;
  $events: Events<E> = {} as Events<E>;

  constructor(opts: () => Options<S, A, E, M>, ctx: InjectionContext) {
    super();

    const {
      name = 'Service',
      strict = false,
      state = {} as S,
      mutations = {} as M,
      actions = [],
      events = [],
      setup
    } = opts();

    this.app = ctx.app;
    this.name = name;

    this._vm = reactive({ state }) as { state: S };

    actions.forEach((key) => {
      this.$actions[key] = new Subject<A[typeof key]>();
    });

    events.forEach((key) => {
      this.$events[key] = new Subject<E[typeof key]>();
    });

    const mutationKeys = Object.keys(mutations) as (keyof M)[];
    mutationKeys.forEach((key) => {
      this.mutations[key] = ((s, p) => {
        mutations[key](s, p);
      }) as M[keyof M];
    });

    Object.keys(this.$actions).forEach((key) => {
      this.subscribe(this.$actions[key], {
        next: (v) => {
          debug(`[Service ${this.name}]: receive new action [${key}].`, 'info');
          debug(v, 'info');
        }
      });
    });

    Object.keys(this.$events).forEach((key) => {
      this.subscribe(this.$events[key], {
        next: (v) => {
          debug(`[Service ${this.name}]: emit new event [${key}].`, 'info');
          debug(v, 'info');
        }
      });
    });

    if (strict && IS_DEV) {
      watch(
        () => this._vm.state,
        () => {
          if (!this.isCommitting) {
            console.error(`do not mutate state outside mutation handlers.`);
          }
        },
        { deep: true, flush: 'sync' }
      );
    }

    if (setup) {
      setup({
        state: this.state,
        $actions: this.$actions,
        $events: this.$events,
        commit: this.commit.bind(this),
        dispatch: this.dispatch.bind(this),
        emit: this.emit.bind(this),
        on: this.on.bind(this),
        subscribe: this.subscribe.bind(this)
      });
    }
  }

  get state() {
    return this._vm.state;
  }

  subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void {
    const subscription = ob.subscribe(observer);
    this.beforeDispose(() => {
      subscription.unsubscribe();
    });
  }

  commit(key: keyof M, payload: Payload<M, keyof M>) {
    this.isCommitting = true;
    this.mutations[key](this.state, payload);
    this.isCommitting = false;
  }

  dispatch<K extends keyof A>(key: K, v: A[K]) {
    this.$actions[key].next(v);
  }

  emit<K extends keyof E>(key: K, v: E[K]) {
    this.$events[key].next(v);
  }

  on<K extends keyof E>(key: K, fn: (v: E[K]) => void) {
    this.subscribe(this.$events[key], {
      next: (v) => {
        fn(v);
      }
    });
  }
}

type ServiceClass<
  S extends Record<string, any> = {},
  A extends Record<string, any> = {},
  E extends Record<string, any> = {},
  M extends Record<string, Mutation<S>> = {}
> = new (ctx: InjectionContext) => Service<S, A, E, M>;

export function createService<
  S extends Record<string, any> = {},
  A extends Record<string, any> = {},
  E extends Record<string, any> = {},
  M extends Record<string, Mutation<S>> = {}
>(options: () => Options<S, A, E, M>): ServiceClass<S, A, E, M> {
  class cls extends Service<S, A, E, M> {
    constructor(ctx: InjectionContext) {
      super(options, ctx);
    }
  }
  return cls;
}
