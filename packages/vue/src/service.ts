import { reactive, watch, App, computed } from 'vue';
import { Observable, Subject, PartialObserver } from 'rxjs';
import { Disposable, debug, InjectionClass, InjectionContext } from './core';
import { getPathField, setPathField } from './util';

const IS_DEV = process.env.NODE_ENV === 'development';

type Actions<A extends Record<string, any>> = {
  [P in keyof A]: Subject<A[P]>;
};

type Events<E extends Record<string, any>> = {
  [P in keyof E]: Subject<E[P]>;
};

type Mutation<S> = (state: S, payload: any) => void;

type MS<S, M> = M & {
  setStateByPath: (state: S, args: { path: string; value: any }) => void;
};

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
};

export default abstract class Service<
    S extends Record<string, any> = {},
    A extends Record<string, any> = {},
    E extends Record<string, any> = {},
    M extends Record<string, Mutation<S>> = {}
  >
  extends Disposable
  implements InjectionClass
{
  private _vm: { state: S };
  private mutations: MS<S, M> = {} as MS<S, M>;
  private isCommitting = false;
  private app: App<Element>;

  name = '';
  $actions: Actions<A> = {} as Actions<A>;
  $events: Events<E> = {} as Events<E>;

  abstract options(): Options<S, A, E, M>;

  constructor(ctx: InjectionContext) {
    super();

    const {
      name = 'Service',
      strict = process.env.NODE_ENV === 'development',
      state = {} as S,
      mutations = {} as MS<S, M>,
      actions = [],
      events = []
    } = this.options();

    this.app = ctx.app;
    this.name = name;

    this._vm = reactive({ state }) as { state: S };

    actions.forEach((key) => {
      this.$actions[key] = new Subject<A[typeof key]>();
    });

    events.forEach((key) => {
      this.$events[key] = new Subject<E[typeof key]>();
    });

    const mutationsList: MS<S, M> = {
      ...mutations,
      setStateByPath(state, args) {
        const { path, value } = args;
        setPathField(state, path, value);
      }
    };
    const mutationKeys = Object.keys(mutationsList) as (keyof MS<S, M>)[];
    mutationKeys.forEach((key) => {
      this.mutations[key] = ((s, p) => {
        mutationsList[key](s, p);
      }) as MS<S, M>[keyof MS<S, M>];
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

  commit<K extends keyof MS<S, M>>(
    key: K,
    payload: Parameters<MS<S, M>[K]>[1]
  ) {
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

  vModel(path: string) {
    return computed({
      get: () => {
        return getPathField(this.state, path);
      },
      set: (value: any) => {
        this.commit('setStateByPath', { path, value });
      }
    });
  }
}
