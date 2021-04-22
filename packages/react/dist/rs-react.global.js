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
                  const { useValue = null, ...rest } = p;
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
                  service = this.parent.get(provide);
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
    message: any;
  }
  type Actions = {
    login: LoginParams;
    logout: undefined;
  };
  class AppService extends Service<State, Actions> {
    constructor() {
      super({
        state: {
          user: null
        },
        actions: ['login', 'logout']
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
      this.$$.message.next('init');
    }
  }
  */
  class Service extends Disposable {
      constructor(args = {}) {
          super();
          // displayName, for debug
          this.displayName = '';
          // notify sources
          this.$$ = {};
          // actions
          this.$ = {};
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

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  /** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var reactIs_development = createCommonjsModule(function (module, exports) {



  {
    (function() {

  // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
  // nor polyfill, then a plain number is used for performance.
  var hasSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
  var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
  var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
  var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
  var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
  var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
  var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
  // (unstable) APIs that have been removed. Can we remove the symbols?

  var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
  var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
  var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
  var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
  var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
  var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
  var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
  var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
  var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
  var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
  var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

  function isValidElementType(type) {
    return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
    type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
  }

  function typeOf(object) {
    if (typeof object === 'object' && object !== null) {
      var $$typeof = object.$$typeof;

      switch ($$typeof) {
        case REACT_ELEMENT_TYPE:
          var type = object.type;

          switch (type) {
            case REACT_ASYNC_MODE_TYPE:
            case REACT_CONCURRENT_MODE_TYPE:
            case REACT_FRAGMENT_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_SUSPENSE_TYPE:
              return type;

            default:
              var $$typeofType = type && type.$$typeof;

              switch ($$typeofType) {
                case REACT_CONTEXT_TYPE:
                case REACT_FORWARD_REF_TYPE:
                case REACT_LAZY_TYPE:
                case REACT_MEMO_TYPE:
                case REACT_PROVIDER_TYPE:
                  return $$typeofType;

                default:
                  return $$typeof;
              }

          }

        case REACT_PORTAL_TYPE:
          return $$typeof;
      }
    }

    return undefined;
  } // AsyncMode is deprecated along with isAsyncMode

  var AsyncMode = REACT_ASYNC_MODE_TYPE;
  var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
  var ContextConsumer = REACT_CONTEXT_TYPE;
  var ContextProvider = REACT_PROVIDER_TYPE;
  var Element = REACT_ELEMENT_TYPE;
  var ForwardRef = REACT_FORWARD_REF_TYPE;
  var Fragment = REACT_FRAGMENT_TYPE;
  var Lazy = REACT_LAZY_TYPE;
  var Memo = REACT_MEMO_TYPE;
  var Portal = REACT_PORTAL_TYPE;
  var Profiler = REACT_PROFILER_TYPE;
  var StrictMode = REACT_STRICT_MODE_TYPE;
  var Suspense = REACT_SUSPENSE_TYPE;
  var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

  function isAsyncMode(object) {
    {
      if (!hasWarnedAboutDeprecatedIsAsyncMode) {
        hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

        console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
      }
    }

    return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
  }
  function isConcurrentMode(object) {
    return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
  }
  function isContextConsumer(object) {
    return typeOf(object) === REACT_CONTEXT_TYPE;
  }
  function isContextProvider(object) {
    return typeOf(object) === REACT_PROVIDER_TYPE;
  }
  function isElement(object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function isForwardRef(object) {
    return typeOf(object) === REACT_FORWARD_REF_TYPE;
  }
  function isFragment(object) {
    return typeOf(object) === REACT_FRAGMENT_TYPE;
  }
  function isLazy(object) {
    return typeOf(object) === REACT_LAZY_TYPE;
  }
  function isMemo(object) {
    return typeOf(object) === REACT_MEMO_TYPE;
  }
  function isPortal(object) {
    return typeOf(object) === REACT_PORTAL_TYPE;
  }
  function isProfiler(object) {
    return typeOf(object) === REACT_PROFILER_TYPE;
  }
  function isStrictMode(object) {
    return typeOf(object) === REACT_STRICT_MODE_TYPE;
  }
  function isSuspense(object) {
    return typeOf(object) === REACT_SUSPENSE_TYPE;
  }

  exports.AsyncMode = AsyncMode;
  exports.ConcurrentMode = ConcurrentMode;
  exports.ContextConsumer = ContextConsumer;
  exports.ContextProvider = ContextProvider;
  exports.Element = Element;
  exports.ForwardRef = ForwardRef;
  exports.Fragment = Fragment;
  exports.Lazy = Lazy;
  exports.Memo = Memo;
  exports.Portal = Portal;
  exports.Profiler = Profiler;
  exports.StrictMode = StrictMode;
  exports.Suspense = Suspense;
  exports.isAsyncMode = isAsyncMode;
  exports.isConcurrentMode = isConcurrentMode;
  exports.isContextConsumer = isContextConsumer;
  exports.isContextProvider = isContextProvider;
  exports.isElement = isElement;
  exports.isForwardRef = isForwardRef;
  exports.isFragment = isFragment;
  exports.isLazy = isLazy;
  exports.isMemo = isMemo;
  exports.isPortal = isPortal;
  exports.isProfiler = isProfiler;
  exports.isStrictMode = isStrictMode;
  exports.isSuspense = isSuspense;
  exports.isValidElementType = isValidElementType;
  exports.typeOf = typeOf;
    })();
  }
  });

  var reactIs = createCommonjsModule(function (module) {

  {
    module.exports = reactIs_development;
  }
  });

  /**
   * Copyright 2015, Yahoo! Inc.
   * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
   */
  var REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
  };
  var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
  };
  var FORWARD_REF_STATICS = {
    '$$typeof': true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
  };
  var MEMO_STATICS = {
    '$$typeof': true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
  };
  var TYPE_STATICS = {};
  TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
  TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

  function getStatics(component) {
    // React v16.11 and below
    if (reactIs.isMemo(component)) {
      return MEMO_STATICS;
    } // React v16.12 and above


    return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
  }

  var defineProperty = Object.defineProperty;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var getPrototypeOf = Object.getPrototypeOf;
  var objectPrototype = Object.prototype;
  function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') {
      // don't hoist over string (html) components
      if (objectPrototype) {
        var inheritedComponent = getPrototypeOf(sourceComponent);

        if (inheritedComponent && inheritedComponent !== objectPrototype) {
          hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
        }
      }

      var keys = getOwnPropertyNames(sourceComponent);

      if (getOwnPropertySymbols) {
        keys = keys.concat(getOwnPropertySymbols(sourceComponent));
      }

      var targetStatics = getStatics(targetComponent);
      var sourceStatics = getStatics(sourceComponent);

      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];

        if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
          var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

          try {
            // Avoid failures from read-only properties
            defineProperty(targetComponent, key, descriptor);
          } catch (e) {}
        }
      }
    }

    return targetComponent;
  }

  var hoistNonReactStatics_cjs = hoistNonReactStatics;

  const InjectorContext = React.createContext(new Injector());
  const ServiceInjector = (props) => {
      const parentInjector = React.useContext(InjectorContext);
      const { providers = [], children } = props;
      const injector = new Injector(providers, parentInjector);
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

  /*
  一般测试，或者封装路由组件列表时使用，因为路由列表时显式添加provider不太方便
  const WrrappedComponent = () => {};
  export default withInjector({
    providers: []
  })
  */
  const withInjector = (args) => {
      return (Component) => {
          const displayName = 'withInjector(' + (Component.displayName || Component.name) + ')';
          const Comp = React.forwardRef((props, ref) => {
              return (React__default.createElement(ServiceInjector, { providers: args.providers },
                  React__default.createElement(Component, Object.assign({ ref: ref }, props))));
          });
          Comp.displayName = displayName;
          return hoistNonReactStatics_cjs(Comp, Component);
      };
  };

  function useRSRef(value) {
      const [state, setState] = React.useState(value);
      const resRef = {
          get current() {
              return state;
          },
          set current(v) {
              setState(v);
          }
      };
      return resRef;
  }
  function useValueRef(value) {
      const ref = React.useRef(value);
      ref.current = value;
      const resRef = {
          get current() {
              return ref.current;
          },
          set current(v) {
              throw new Error(`Can not set value to this ref of useRSWatchRef!`);
          }
      };
      return resRef;
  }
  function useGetService() {
      const provider = React.useContext(InjectorContext);
      const getService = React.useCallback((provide, opts) => {
          return provider.get(provide, opts);
      }, [provider]);
      return getService;
  }
  const useService = (provide, opts) => {
      const getService = useGetService();
      const service = getService(provide, opts);
      return service;
  };
  function useObservable(ob$, defaultValue) {
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
  }
  function useBehavior(ob$) {
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
  }
  function useObservableError(ob$, onlyAfter = false) {
      const [state, setState] = React.useState(null);
      React.useEffect(() => {
          const ignore = ob$ instanceof rxjs.Subject && onlyAfter && ob$.hasError;
          if (ignore)
              return;
          const subscription = ob$.subscribe({
              error: (err) => {
                  setState(err);
              }
          });
          return () => {
              subscription.unsubscribe();
          };
      }, [ob$, onlyAfter]);
      return state;
  }
  function useListenValue(value, listner) {
      const ref = React.useRef(listner);
      ref.current = listner;
      React.useEffect(() => {
          ref.current(value);
      }, [value]);
  }

  exports.Disposable = Disposable;
  exports.InjectionToken = InjectionToken;
  exports.Injector = Injector;
  exports.Service = Service;
  exports.ServiceConsumer = ServiceConsumer;
  exports.ServiceInjector = ServiceInjector;
  exports.config = config;
  exports.debug = debug;
  exports.empty = empty;
  exports.useBehavior = useBehavior;
  exports.useGetService = useGetService;
  exports.useListenValue = useListenValue;
  exports.useObservable = useObservable;
  exports.useObservableError = useObservableError;
  exports.useRSRef = useRSRef;
  exports.useService = useService;
  exports.useValueRef = useValueRef;
  exports.withInjector = withInjector;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}, rxjs, React));
