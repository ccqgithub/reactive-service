'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rxjs = require('rxjs');

const configSettings = {
    logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'error',
    log: (msg, type = 'info') => {
        console && console[type] && console[type](msg);
    }
};
const config = (args) => {
    const keys = Object.keys(configSettings);
    keys.forEach((key) => {
        if (typeof args[key] !== 'undefined') {
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
const empty = Symbol('empty');

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

// service injector
class Injector {
    constructor(providers = [], parent = null) {
        // 父 injector
        this.parent = null;
        // 当前 injector 上的服务记录
        this.records = new Map();
        this.parent = parent;
        // provider records
        providers.forEach((provider) => {
            let record;
            let provide;
            if (typeof provider === 'object' &&
                typeof provider.provide !== 'undefined' &&
                (provider.useClass || provider.useValue)) {
                // provider is a config object
                provide = provider.provide;
                record = {
                    value: provider.useValue || null,
                    useClass: provider.useClass || null,
                    dispose: provider.dispose || null
                };
            }
            else if (typeof provider === 'function' &&
                typeof provider.prototype.constructor === 'function') {
                // provider is a class
                provide = provider;
                record = {
                    value: null,
                    useClass: provider,
                    dispose: null
                };
            }
            else {
                // error provider config
                debug(provider);
                throw new Error('Error provider onfig!');
            }
            this.records.set(provide, record);
        });
    }
    isRegistered(provide) {
        if (this.records.has(provide))
            return true;
        if (this.parent)
            return this.parent.isRegistered(provide);
        return false;
    }
    get(provide) {
        const record = this.records.get(provide);
        let service;
        if (record && !record.value && record.useClass) {
            service = this.$_initClass(record.useClass);
            record.value = service;
        }
        if (!record || !record.value) {
            debug(provide, 'error');
            throw new Error(`The service not be registered on this injector or any of the parent injector!`);
        }
        return record.value;
    }
    $_initClass(useClass) {
        // 实例化类的时候，绑定一个parent injector（this injector），这样的话，这个类在内部依赖其他服务的时候，就能使用它
        const lastGetParentInjector = useClass.prototype.$_getParentInjector || null;
        useClass.prototype.$_getParentInjector = () => {
            return this;
        };
        const service = new useClass();
        service.$_parentInjector = this;
        service.$_getParentInjector = null;
        useClass.prototype.$_getParentInjector = lastGetParentInjector;
        return service;
    }
    dispose() {
        for (const [, record] of this.records) {
            if (!record.value)
                return;
            if (record.dispose) {
                record.dispose(record.value);
            }
            else if (typeof record.value.dispose === 'function') {
                record.value.dispose(record.value);
            }
        }
        this.parent = null;
        this.records.clear();
    }
    // 在服务内获取父Injector
    static getParentInjector(service) {
        let parentInjector = null;
        if (typeof service.$_parentInjector === 'object') {
            // 实例已经创建时
            parentInjector = service.$_parentInjector;
        }
        else if (typeof service.$_getParentInjector === 'function') {
            // 还在执行构造函数中时
            parentInjector = service.$_getParentInjector(service);
        }
        return parentInjector;
    }
}

// Service 服务基类
class Service extends Disposable {
    constructor(args = {}) {
        super();
        // displayName, for debug
        this.displayName = '';
        // notify sources
        this.$$ = {};
        // actions
        this.$ = {};
        // provide services
        this.$_injector = new Injector(args.providers || [], Injector.getParentInjector(this));
        this.beforeDispose(() => {
            this.$_injector.dispose();
        });
        // displayName
        if (!this.displayName) {
            this.displayName = this.constructor.name;
            debug(`[Service ${this.displayName}]: For better debugging, you'd better add an attribute 'displayName' to each service class.`, 'warn');
        }
        // init state
        const initialState = (args.state || {});
        Object.keys(initialState).forEach((key) => {
            if (initialState[key] === undefined || initialState[key] === empty) {
                this.$$[key] = new rxjs.Subject();
            }
            else {
                this.$$[key] = new rxjs.BehaviorSubject(initialState[key]);
            }
        });
        // init actions
        const actions = args.actions || [];
        actions.forEach((key) => {
            this.$[key] = new rxjs.Subject();
        });
        // debugs: update state
        Object.keys(this.$$).forEach((key) => {
            this.useSubscribe(this.$$[key], {
                next: (v) => {
                    debug(`[Service ${this.displayName}]: set new state [${key}].`, 'info');
                    debug(v, 'info');
                }
            });
        });
        // debugs: new action
        Object.keys(this.$).forEach((key) => {
            this.useSubscribe(this.$[key], {
                next: (v) => {
                    debug(`[Service ${this.displayName}]: receive new action [${key}].`, 'info');
                    debug(v, 'info');
                }
            });
        });
    }
    // state
    get state() {
        const state = {};
        Object.keys(this.$$).forEach((key) => {
            if (this.$$[key] instanceof rxjs.BehaviorSubject) {
                state[key] = this.$$[key].value;
            }
        });
        return state;
    }
    useService(provide) {
        const injector = this.$_injector;
        return injector.get(provide);
    }
    useSubscribe(ob, ...args) {
        const subscription = ob.subscribe(...args);
        this.beforeDispose(() => {
            subscription.unsubscribe();
        });
    }
}

exports.Disposable = Disposable;
exports.Injector = Injector;
exports.Service = Service;
exports.config = config;
exports.empty = empty;