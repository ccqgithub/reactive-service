(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue'), require('rxjs')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue', 'rxjs'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.RSVue = {}, global.Vue, global.rxjs));
}(this, (function (exports, vue, rxjs) { 'use strict';

  const configSettings = {
      logLevel: 'info' ,
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
      constructor(providers, opts) {
          // parent injector
          this.parent = null;
          // 当前 injector 上的服务记录
          this.records = new Map();
          const { parent = null, app } = opts;
          this.app = app;
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
              app: this.app,
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
          const instance = vue.getCurrentInstance();
          const parentInjector = vue.inject(injectorKey);
          const injector = new Injector(props.providers, {
              parent: parentInjector || null,
              app: instance === null || instance === void 0 ? void 0 : instance.appContext.app
          });
          vue.provide(injectorKey, injector);
      }
  });

  const getPathField = (state, path) => {
      return path.split(/[.[\]]+/).reduce((prev, key) => prev[key], state);
  };
  const setPathField = (state, path, value) => {
      path.split(/[.[\]]+/).reduce((prev, key, index, array) => {
          if (array.length === index + 1) {
              prev[key] = value;
          }
          return prev[key];
      }, state);
  };

  const IS_DEV = "development" === 'development';
  class Service extends Disposable {
      constructor(ctx) {
          super();
          this.mutations = {};
          this.isCommitting = false;
          this.name = '';
          this.$actions = {};
          this.$events = {};
          const { name = 'Service', strict = "development" === 'development', state = {}, mutations = {}, actions = [], events = [] } = this.options();
          this.app = ctx.app;
          this.name = name;
          this._vm = vue.reactive({ state });
          actions.forEach((key) => {
              this.$actions[key] = new rxjs.Subject();
          });
          events.forEach((key) => {
              this.$events[key] = new rxjs.Subject();
          });
          const mutationsList = Object.assign(Object.assign({}, mutations), { setStateByPath(state, args) {
                  const { path, value } = args;
                  setPathField(state, path, value);
              } });
          const mutationKeys = Object.keys(mutationsList);
          mutationKeys.forEach((key) => {
              this.mutations[key] = ((s, p) => {
                  mutationsList[key](s, p);
              });
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
              vue.watch(() => this._vm.state, () => {
                  if (!this.isCommitting) {
                      console.error(`do not mutate state outside mutation handlers.`);
                  }
              }, { deep: true, flush: 'sync' });
          }
      }
      get state() {
          return this._vm.state;
      }
      subscribe(ob, observer) {
          const subscription = ob.subscribe(observer);
          this.beforeDispose(() => {
              subscription.unsubscribe();
          });
      }
      commit(key, payload) {
          this.isCommitting = true;
          this.mutations[key](this.state, payload);
          this.isCommitting = false;
      }
      dispatch(key, v) {
          this.$actions[key].next(v);
      }
      emit(key, v) {
          this.$events[key].next(v);
      }
      on(key, fn) {
          this.subscribe(this.$events[key], {
              next: (v) => {
                  fn(v);
              }
          });
      }
      vModel(path) {
          return vue.computed({
              get: () => {
                  return getPathField(this.state, path);
              },
              set: (value) => {
                  this.commit('setStateByPath', { path, value });
              }
          });
      }
  }

  const useInjector = (args) => {
      const instance = vue.getCurrentInstance();
      const parentInjector = vue.inject(injectorKey, null);
      const injector = new Injector(args.providers, {
          parent: parentInjector,
          app: instance.appContext.app
      });
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
  function useRx() {
      const subs = [];
      vue.onBeforeUnmount(() => {
          subs.forEach((sub) => {
              sub.unsubscribe();
          });
      });
      const subscribe = (ob$, observer) => {
          const sub = ob$.subscribe(observer);
          subs.push(sub);
          const unsubscribe = () => {
              sub.unsubscribe();
              const i = subs.indexOf(sub);
              if (i !== -1)
                  subs.splice(i, 1);
          };
          return unsubscribe;
      };
      const refBehavior = (ob$) => {
          const res = vue.ref(ob$.value);
          subscribe(ob$, {
              next: (v) => {
                  res.value = v;
              }
          });
          return res;
      };
      const refObservable = (ob$, defaultValue) => {
          const res = vue.ref(defaultValue);
          subscribe(ob$, {
              next: (v) => {
                  res.value = v;
              }
          });
          return res;
      };
      const refObservableError = (ob$, defaultValue, opts = { onlyAfter: true }) => {
          const res = vue.ref(defaultValue);
          let isAfter = false;
          subscribe(ob$, {
              error: (err) => {
                  if (opts.onlyAfter && !isAfter)
                      return;
                  res.value = err;
              }
          });
          isAfter = true;
          return res;
      };
      return {
          subscribe,
          refObservable,
          refBehavior,
          refObservableError
      };
  }

  exports.Disposable = Disposable;
  exports.InjectionToken = InjectionToken;
  exports.Injector = Injector;
  exports.Service = Service;
  exports.ServiceInjector = ServiceInjector;
  exports.config = config;
  exports.debug = debug;
  exports.getPathField = getPathField;
  exports.setPathField = setPathField;
  exports.useGetService = useGetService;
  exports.useInjector = useInjector;
  exports.useRx = useRx;
  exports.useService = useService;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
