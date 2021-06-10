import { Injector, Disposable, debug } from '@reactive-service/core';
export * from '@reactive-service/core';
import { defineComponent, inject, provide, reactive, readonly, getCurrentInstance, ref, onBeforeUnmount } from 'vue';
import { Subject, BehaviorSubject } from 'rxjs';

const injectorKey = Symbol('Injector Key');
const instanceInjectorKey = Symbol('Instance Injector Key');

const ServiceInjector = defineComponent({
    props: {
        providers: { type: Object, required: true }
    },
    setup(props) {
        const parentInjector = inject(injectorKey);
        const injector = new Injector(props.providers, parentInjector);
        provide(injectorKey, injector);
    }
});

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
class Service extends Disposable {
    constructor(args = {}) {
        super();
        // displayName, for debug
        this.displayName = '';
        // actions
        this.$ = {};
        // notifies
        this.$e = {};
        // init state
        const _state = reactive(args.state || {});
        const state = readonly(_state);
        this._state = _state;
        this.state = state;
        // init actions
        const actions = args.actions || [];
        actions.forEach((key) => {
            this.$[key] = new Subject();
        });
        // init events
        const events = args.events || [];
        events.forEach((key) => {
            this.$e[key] = new Subject();
        });
        // debug
        // debugs: new action
        Object.keys(this.$).forEach((key) => {
            this.subscribe(this.$[key], {
                next: (v) => {
                    debug(`[Service ${this.displayName}]: receive new action [${key}].`, 'info');
                    debug(v, 'info');
                }
            });
        });
        // debugs: new event
        Object.keys(this.$e).forEach((key) => {
            this.subscribe(this.$e[key], {
                next: (v) => {
                    debug(`[Service ${this.displayName}]: emit new event [${key}].`, 'info');
                    debug(v, 'info');
                }
            });
        });
    }
    setState(fn) {
        fn(this._state);
    }
    subscribe(ob, ...args) {
        const subscription = ob.subscribe(...args);
        this.beforeDispose(() => {
            subscription.unsubscribe();
        });
    }
}

const useInjector = (args) => {
    const instance = getCurrentInstance();
    const parentInjector = inject(injectorKey, null);
    const injector = new Injector(args.providers, parentInjector);
    instance[instanceInjectorKey] = injector;
    provide(injectorKey, injector);
};
const useGetService = () => {
    const instance = getCurrentInstance();
    const injector = instance[instanceInjectorKey] || inject(injectorKey, null);
    const getService = (provide, opts) => {
        if (!injector) {
            if (!opts || !opts.optional) {
                throw new Error(`Never register any injector!`);
            }
            return null;
        }
        return injector.get(provide, opts);
    };
    return getService;
};
const useService = (provide, opts) => {
    const instance = getCurrentInstance();
    const injector = instance[instanceInjectorKey] || inject(injectorKey, null);
    if (!injector) {
        if (!opts || !opts.optional) {
            throw new Error(`Never register any injectorå!`);
        }
        return null;
    }
    return injector.get(provide, opts);
};
const useObservable = (ob$, defaultValue) => {
    const state = ref(defaultValue);
    const subscription = ob$.subscribe({
        next: (v) => (state.value = v)
    });
    onBeforeUnmount(() => {
        subscription.unsubscribe();
    });
    return state;
};
const useBehavior = (ob$) => {
    if (!(ob$ instanceof BehaviorSubject)) {
        throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
    }
    const state = ref(ob$.value);
    const subscription = ob$.subscribe({
        next: (v) => (state.value = v)
    });
    onBeforeUnmount(() => {
        subscription.unsubscribe();
    });
    return state;
};
const useObservableError = (ob$, defaultValue = null, opts = { onlyAfter: true }) => {
    const state = ref(defaultValue);
    let isAfter = false;
    const subscription = ob$.subscribe({
        error: (err) => {
            if (opts.onlyAfter && !isAfter)
                return;
            state.value = err;
        }
    });
    isAfter = true;
    onBeforeUnmount(() => {
        subscription.unsubscribe();
    });
    return state;
};
function useSubscribe(ob$, observer) {
    const subscription = ob$.subscribe(observer);
    onBeforeUnmount(() => {
        subscription.unsubscribe();
    });
}

export { Service, ServiceInjector, useBehavior, useGetService, useInjector, useObservable, useObservableError, useService, useSubscribe };
