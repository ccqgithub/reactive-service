'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');
var rxjs = require('rxjs');

const configSettings = {
    logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'error',
    log: (msg, type = 'info') => {
        console && console[type] && console[type](msg);
    }
};
const config = (args) => {
    const keys = Object.keys(args);
    keys.forEach((key) => {
        if (key in configSettings && typeof args[key] !== 'undefined') {
            configSettings[key] = args[key];
        }
    });
};
const debug = (msg, type = 'info', condition = true) => {
    if (!condition)
        return;
    const levels = ['info', 'warn', 'error', 'never'];
    if (levels.indexOf(configSettings.logLevel) > levels.indexOf(type))
        return;
    configSettings.log(msg, type);
};

class Disposable {
    constructor() {
        this.$_disposers = [];
    }
    beforeDispose(disposer) {
        this.$_disposers.push(disposer);
    }
    dispose() {
        this.$_disposers.forEach((disposer) => {
            disposer();
        });
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __rest(s, e) {
  var t = {};

  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}

class InjectionToken {
    constructor(desc, options) {
        this._desc = desc;
        this.factory = options === null || options === void 0 ? void 0 : options.factory;
    }
    toString() {
        return `InjectionToken: ${this._desc}`;
    }
}

// service injector
class Injector {
    constructor(providers = [], parent = null) {
        // parent injector
        this.parent = null;
        // 当前 injector 上的服务记录
        this.records = new Map();
        this.parent = parent;
        // provider records
        providers.forEach((provider) => {
            let record = null;
            if (typeof provider === 'object') {
                // [{ provide, ...}]
                const p = provider;
                // check
                const keys = ['useValue', 'useClass', 'useExisiting', 'useFactory'];
                let apear = 0;
                keys.forEach((key) => {
                    if (typeof p[key] !== 'undefined') {
                        apear++;
                    }
                });
                if (apear > 1) {
                    debug(`These keys [${keys.join(',')}] can only use one, other will be ignored!`, 'warn');
                }
                // normalize
                const { useValue = undefined } = p, rest = __rest(p, ["useValue"]);
                record = Object.assign(Object.assign({}, rest), { value: useValue });
            }
            else if (typeof provider === 'function' &&
                typeof provider.prototype.constructor ===
                    'function') {
                // [class]
                const p = provider;
                record = {
                    provide: p,
                    useClass: p
                };
            }
            if (!record) {
                debug(provider);
                throw new Error('Error provider onfig!');
            }
            const hasTokenFactory = record.provide instanceof InjectionToken && record.useFactory;
            if (typeof record.value === 'undefined' &&
                !record.useClass &&
                !record.useExisiting &&
                !record.useFactory &&
                !hasTokenFactory) {
                debug(provider);
                throw new Error('Error provider onfig!');
            }
            this.records.set(record.provide, record);
        });
    }
    isProvided(provide) {
        if (this.records.has(provide))
            return true;
        if (this.parent)
            return this.parent.isProvided(provide);
        return false;
    }
    get(provide, args) {
        const record = this.records.get(provide);
        let service = null;
        // not register on self
        if (!record) {
            if (this.parent)
                service = this.parent.get(provide, args);
        }
        else {
            // lazy init service
            if (typeof record.value === 'undefined') {
                this.$_initRecord(record);
            }
            service = record.value || null;
        }
        if (!service && !(args === null || args === void 0 ? void 0 : args.optional)) {
            throw new Error(`Service not be provided, and not optional!`);
        }
        return service;
    }
    $_initRecord(record) {
        const ctx = {
            useService: (provide, opts) => {
                return this.get(provide, opts);
            }
        };
        // token 中的 factory 优先
        // injection token's default value
        if (record.provide instanceof InjectionToken && record.provide.factory) {
            record.value = record.provide.factory(ctx);
        }
        // use class
        if (record.useClass) {
            // find deps for the useClass
            record.value = new record.useClass(ctx);
            return;
        }
        // alias: use exisiting
        if (record.useExisiting) {
            record.value = this.get(record.useExisiting);
            return;
        }
        // use factory
        if (record.useFactory) {
            record.value = record.useFactory(ctx);
        }
    }
    dispose() {
        for (const [, record] of this.records) {
            if (!record.value)
                return;
            if (record.dispose) {
                record.dispose(record.value);
            }
            else if (typeof record.value.dispose === 'function') {
                record.value.dispose();
            }
        }
        this.parent = null;
        this.records.clear();
    }
}

const injectorKey = Symbol('Injector Key');
const instanceInjectorKey = Symbol('Instance Injector Key');

const ServiceInjector = vue.defineComponent({
    props: {
        providers: { type: Object, required: true }
    },
    setup(props) {
        const parentInjector = vue.inject(injectorKey);
        const injector = new Injector(props.providers, parentInjector);
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
class Service extends Disposable {
    constructor(args = {}) {
        super();
        // displayName, for debug
        this.displayName = '';
        // actions
        this.$a = {};
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
            this.$a[key] = new rxjs.Subject();
        });
        // init events
        const events = args.events || [];
        events.forEach((key) => {
            this.$e[key] = new rxjs.Subject();
        });
        // debug
        // debugs: new action
        Object.keys(this.$a).forEach((key) => {
            this.subscribe(this.$a[key], {
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
    subscribe(ob, observer) {
        const subscription = ob.subscribe(observer);
        this.beforeDispose(() => {
            subscription.unsubscribe();
        });
    }
}

const useInjector = (args) => {
    const instance = vue.getCurrentInstance();
    const parentInjector = vue.inject(injectorKey, null);
    const injector = new Injector(args.providers, parentInjector);
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

exports.Disposable = Disposable;
exports.InjectionToken = InjectionToken;
exports.Injector = Injector;
exports.Service = Service;
exports.ServiceInjector = ServiceInjector;
exports.config = config;
exports.debug = debug;
exports.useBehavior = useBehavior;
exports.useGetService = useGetService;
exports.useInjector = useInjector;
exports.useObservable = useObservable;
exports.useObservableError = useObservableError;
exports.useService = useService;
exports.useSubscribe = useSubscribe;
