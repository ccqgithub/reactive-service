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
    const getService = (provide, opts = {}) => {
        const { optional = false } = opts;
        const service = injector.get(provide);
        if (!service && !optional) {
            core.debug(provide, 'error');
            throw new Error(`Can not find the service, you provide it?`);
        }
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
        get value() {
            return state;
        },
        set value(v) {
            setState(v);
        }
    };
    return resRef;
}
function useRSValueRef(value) {
    const ref = React.useRef(value);
    ref.current = value;
    const resRef = {
        get value() {
            return ref.current;
        },
        set value(v) {
            throw new Error(`Can not set value to this ref of useRSWatchRef!`);
        }
    };
    return resRef;
}
function useGetService() {
    const provider = React.useContext(InjectorContext);
    const getService = React.useCallback((provide) => {
        return provider.get(provide);
    }, [provider]);
    return getService;
}
function useService(provide) {
    const getService = useGetService();
    const service = getService(provide);
    const ref = useRSValueRef(service);
    return [service, ref];
}
function useObservableRef(ob$, defaultValue) {
    const ref = useRSRef(defaultValue);
    const resRef = {
        get value() {
            return ref.value;
        },
        set value(v) {
            throw new Error(`Can not set value to this ref of useObservableRef!`);
        }
    };
    React.useEffect(() => {
        const subscription = ob$.subscribe({
            next: (v) => (ref.value = v)
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [ob$, ref]);
    return resRef;
}
function useBehaviorRef(ob$) {
    if (!(ob$ instanceof rxjs.BehaviorSubject)) {
        throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
    }
    const ref = useRSRef(ob$.value);
    const resRef = {
        get value() {
            return ref.value;
        },
        set value(v) {
            throw new Error(`Can not set value to this ref of useBehaviorRef!`);
        }
    };
    React.useEffect(() => {
        const subscription = ob$.subscribe({
            next: (v) => (ref.value = v)
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [ob$, ref]);
    return resRef;
}
function useObservableError(ob$, onlyAfter = false) {
    const ref = useRSRef(null);
    const resRef = {
        get value() {
            return ref.value;
        },
        set value(v) {
            throw new Error(`Can not set value to this ref of useBehaviorRef!`);
        }
    };
    React.useEffect(() => {
        const ignore = ob$ instanceof rxjs.Subject && onlyAfter && ob$.hasError;
        if (ignore)
            return;
        const subscription = ob$.subscribe({
            error: (err) => {
                ref.value = err;
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [ob$, onlyAfter, ref]);
    return resRef;
}
function useListener(value, listner) {
    const ref = React.useRef(listner);
    ref.current = listner;
    React.useEffect(() => {
        ref.current(value);
    }, [value]);
}

exports.ServiceConsumer = ServiceConsumer;
exports.ServiceInjector = ServiceInjector;
exports.useBehaviorRef = useBehaviorRef;
exports.useGetService = useGetService;
exports.useListener = useListener;
exports.useObservableError = useObservableError;
exports.useObservableRef = useObservableRef;
exports.useRSRef = useRSRef;
exports.useRSValueRef = useRSValueRef;
exports.useService = useService;
exports.withInjector = withInjector;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) exports[k] = core[k];
});
