'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@reactive-service/core');
var React = require('react');
var hoistStatics = require('hoist-non-react-statics');
var rxjs = require('rxjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var hoistStatics__default = /*#__PURE__*/_interopDefaultLegacy(hoistStatics);

const InjectorContext = React.createContext(new core.Injector());
const ServiceInjector = (props) => {
    const parentInjector = React.useContext(InjectorContext);
    const { providers = [], children } = props;
    const injector = new core.Injector(providers, parentInjector);
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
        return hoistStatics__default(Comp, Component);
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
function useSubscribe(ob$, args) {
    const argsRef = useValueRef(args);
    React.useEffect(() => {
        const subscription = ob$.subscribe((v) => argsRef.current.next && argsRef.current.next(v), (err) => argsRef.current.error && argsRef.current.error(err), () => argsRef.current.complete && argsRef.current.complete());
        return () => {
            subscription.unsubscribe();
        };
    }, [ob$, argsRef]);
}

exports.ServiceConsumer = ServiceConsumer;
exports.ServiceInjector = ServiceInjector;
exports.useBehavior = useBehavior;
exports.useGetService = useGetService;
exports.useListenValue = useListenValue;
exports.useObservable = useObservable;
exports.useObservableError = useObservableError;
exports.useRSRef = useRSRef;
exports.useService = useService;
exports.useSubscribe = useSubscribe;
exports.useValueRef = useValueRef;
exports.withInjector = withInjector;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) exports[k] = core[k];
});
