var RSReact = (function (exports, rxjs, React) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

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

  class InjectionToken {
      constructor(desc, options) {
          this._desc = desc;
          this.factory = options?.factory;
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
                  const { useValue = undefined, ...rest } = p;
                  record = {
                      ...rest,
                      value: useValue
                  };
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
          if (!service && !args?.optional) {
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
        this.$.login.pipe(
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
          // state
          this.$$ = {};
          // actions
          this.$ = {};
          // notifies
          this.$e = {};
          // init state
          const initialState = (args.state || {});
          Object.keys(initialState).forEach((key) => {
              this.$$[key] = new rxjs.BehaviorSubject(initialState[key]);
          });
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
          // debugs: update state
          Object.keys(this.$$).forEach((key) => {
              this.subscribe(this.$$[key], {
                  next: (v) => {
                      debug(`[Service ${this.displayName}]: set new state [${key}].`, 'info');
                      debug(v, 'info');
                  }
              });
          });
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
      // state
      get state() {
          const state = {};
          Object.keys(this.$$).forEach((key) => {
              const source = this.$$[key];
              if (source instanceof rxjs.BehaviorSubject) {
                  state[key] = source.value;
              }
          });
          return state;
      }
      subscribe(ob, ...args) {
          const subscription = ob.subscribe(...args);
          this.beforeDispose(() => {
              subscription.unsubscribe();
          });
      }
  }

  const InjectorContext = React.createContext(new Injector());
  const ServiceInjector = (props) => {
      const isFirstRef = React.useRef(true);
      const parentInjector = React.useContext(InjectorContext);
      const { providers = [], children } = props;
      const [injector, setInjector] = React.useState(() => new Injector(providers, parentInjector));
      React.useEffect(() => {
          if (isFirstRef.current) {
              isFirstRef.current = false;
              return;
          }
          const injector = new Injector(providers, parentInjector);
          setInjector(injector);
          // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [providers, parentInjector]);
      return (React__default.createElement(InjectorContext.Provider, { value: injector }, children));
  };
  const ServiceConsumer = (props) => {
      const injector = React.useContext(InjectorContext);
      const getService = (provide, opts) => {
          return injector.get(provide, opts);
      };
      return typeof props.children === 'function'
          ? props.children({ getService })
          : props.children;
  };

  const useGetService = () => {
      const provider = React.useContext(InjectorContext);
      const getService = React.useCallback((provide, opts) => {
          return provider.get(provide, opts);
      }, [provider]);
      return getService;
  };
  const useService = (provide, opts) => {
      const getService = useGetService();
      const service = getService(provide, opts);
      return service;
  };
  const useObservable = (ob$, defaultValue) => {
      const [state, setState] = React.useState(defaultValue);
      React.useEffect(() => {
          const subscription = ob$.subscribe({
              next: (v) => setState(v)
          });
          return () => {
              subscription.unsubscribe();
          };
      }, [ob$]);
      return state;
  };
  const useBehavior = (ob$) => {
      if (!(ob$ instanceof rxjs.BehaviorSubject)) {
          throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
      }
      const [state, setState] = React.useState(ob$.value);
      React.useEffect(() => {
          const subscription = ob$.subscribe({
              next: (v) => setState(v)
          });
          return () => {
              subscription.unsubscribe();
          };
      }, [ob$]);
      return state;
  };
  const useObservableError = (ob$, defaultValue = null, opts = { onlyAfter: true }) => {
      const [state, setState] = React.useState(defaultValue);
      React.useEffect(() => {
          let isAfter = false;
          const subscription = ob$.subscribe({
              error: (err) => {
                  if (opts.onlyAfter && !isAfter)
                      return;
                  setState(err);
              }
          });
          isAfter = true;
          return () => {
              subscription.unsubscribe();
          };
      }, [ob$, opts.onlyAfter]);
      return state;
  };
  function useSubscribe(ob$, next, error, complete) {
      const args = React.useMemo(() => {
          if (typeof next === 'object' && next !== null) {
              return next;
          }
          return {
              next,
              error,
              complete
          };
      }, [next, error, complete]);
      const argsRef = React.useRef(args);
      argsRef.current = args;
      React.useEffect(() => {
          const subscription = ob$.subscribe((v) => argsRef.current.next && argsRef.current.next(v), (err) => argsRef.current.error && argsRef.current.error(err), () => argsRef.current.complete && argsRef.current.complete());
          return () => {
              subscription.unsubscribe();
          };
      }, [ob$, argsRef]);
  }

  exports.Disposable = Disposable;
  exports.InjectionToken = InjectionToken;
  exports.Injector = Injector;
  exports.Service = Service;
  exports.ServiceConsumer = ServiceConsumer;
  exports.ServiceInjector = ServiceInjector;
  exports.config = config;
  exports.debug = debug;
  exports.useBehavior = useBehavior;
  exports.useGetService = useGetService;
  exports.useObservable = useObservable;
  exports.useObservableError = useObservableError;
  exports.useService = useService;
  exports.useSubscribe = useSubscribe;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}, rxjs, React));
