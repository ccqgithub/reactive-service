'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@reactive-service/core');
var vue = require('vue');
var rxjs = require('rxjs');

const injectorKey = Symbol('Injector Key');
const instanceInjectorKey = Symbol('Instance Injector Key');

const ServiceInjector = vue.defineComponent({
    props: {
        providers: { type: Object, required: true }
    },
    setup(props) {
        const parentInjector = vue.inject(injectorKey);
        const injector = new core.Injector(props.providers, parentInjector);
        vue.provide(injectorKey, injector);
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
class Service extends core.Disposable {
    constructor(args = {}) {
        super();
        // displayName, for debug
        this.displayName = '';
        // actions
        this.$ = {};
        // notifies
        this.$e = {};
        // init state
        const _state = vue.reactive(args.state || {});
        const state = vue.readonly(_state);
        this._state = _state;
        this.state = state;
        // init actions
        const actions = args.actions || [];
        actions.forEach((key) => {
            this.$[key] = new rxjs.Subject();
        });
        // init events
        const events = args.events || [];
        events.forEach((key) => {
            this.$e[key] = new rxjs.Subject();
        });
        // debug
        // debugs: new action
        Object.keys(this.$).forEach((key) => {
            this.subscribe(this.$[key], {
                next: (v) => {
                    core.debug(`[Service ${this.displayName}]: receive new action [${key}].`, 'info');
                    core.debug(v, 'info');
                }
            });
        });
        // debugs: new event
        Object.keys(this.$e).forEach((key) => {
            this.subscribe(this.$e[key], {
                next: (v) => {
                    core.debug(`[Service ${this.displayName}]: emit new event [${key}].`, 'info');
                    core.debug(v, 'info');
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
    const instance = vue.getCurrentInstance();
    const parentInjector = vue.inject(injectorKey, null);
    const injector = new core.Injector(args.providers, parentInjector);
    instance[instanceInjectorKey] = injector;
    vue.provide(injectorKey, injector);
};
const useGetService = () => {
    const instance = vue.getCurrentInstance();
    const injector = instance[instanceInjectorKey] || vue.inject(injectorKey, null);
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
    const instance = vue.getCurrentInstance();
    const injector = instance[instanceInjectorKey] || vue.inject(injectorKey, null);
    if (!injector) {
        if (!opts || !opts.optional) {
            throw new Error(`Never register any injectorå!`);
        }
        return null;
    }
    return injector.get(provide, opts);
};
const useObservable = (ob$, defaultValue) => {
    const state = vue.ref(defaultValue);
    const subscription = ob$.subscribe({
        next: (v) => (state.value = v)
    });
    vue.onBeforeUnmount(() => {
        subscription.unsubscribe();
    });
    return state;
};
const useBehavior = (ob$) => {
    if (!(ob$ instanceof rxjs.BehaviorSubject)) {
        throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
    }
    const state = vue.ref(ob$.value);
    const subscription = ob$.subscribe({
        next: (v) => (state.value = v)
    });
    vue.onBeforeUnmount(() => {
        subscription.unsubscribe();
    });
    return state;
};
const useObservableError = (ob$, defaultValue = null, opts = { onlyAfter: true }) => {
    const state = vue.ref(defaultValue);
    let isAfter = false;
    const subscription = ob$.subscribe({
        error: (err) => {
            if (opts.onlyAfter && !isAfter)
                return;
            state.value = err;
        }
    });
    isAfter = true;
    vue.onBeforeUnmount(() => {
        subscription.unsubscribe();
    });
    return state;
};
function useSubscribe(ob$, observer) {
    const subscription = ob$.subscribe(observer);
    vue.onBeforeUnmount(() => {
        subscription.unsubscribe();
    });
}

exports.Service = Service;
exports.ServiceInjector = ServiceInjector;
exports.useBehavior = useBehavior;
exports.useGetService = useGetService;
exports.useInjector = useInjector;
exports.useObservable = useObservable;
exports.useObservableError = useObservableError;
exports.useService = useService;
exports.useSubscribe = useSubscribe;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () {
      return core[k];
    }
  });
});
