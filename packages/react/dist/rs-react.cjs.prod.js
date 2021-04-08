'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@reactive-service/core');
var React = require('react');
var hoistStatics = require('hoist-non-react-statics');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');

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

function useGetService() {
    const provider = React.useContext(InjectorContext);
    const getService = React.useCallback((provide) => {
        return provider.get(provide);
    }, [provider]);
    return getService;
}
const useService = (provide) => {
    const getService = useGetService();
    return getService(provide);
};
function useServices(provides) {
    const getService = useGetService();
    return provides.map((provide) => getService(provide));
}
function useObservableChange(ob$, callback) {
    const callbackRef = React.useRef(callback);
    callbackRef.current = callback;
    React.useEffect(() => {
        const subscription = ob$.subscribe({
            next: (v) => callbackRef.current(v)
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [ob$]);
}
function useBehaviorChange(ob$, callback) {
    if (ob$ instanceof rxjs.BehaviorSubject) {
        ob$ = ob$.pipe(operators.skip(1));
    }
    else {
        core.debug(ob$, 'warn');
        core.debug(`Yout are use useBehaviorChange on a observable that is not BehaviorSubject!`, 'warn');
    }
    const callbackRef = React.useRef(callback);
    callbackRef.current = callback;
    React.useEffect(() => {
        const subscription = ob$.subscribe({
            next: (v) => callbackRef.current(v)
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [ob$]);
}
function useObservableState(ob$, defaultValue) {
    const [state, setState] = React.useState(() => {
        if (ob$ instanceof rxjs.BehaviorSubject)
            return ob$.value;
        return defaultValue;
    });
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
function useBehaviorState(ob$) {
    const [state, setState] = React.useState(() => {
        return ob$.value;
    });
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
    const [error, setError] = React.useState(null);
    const ignore = React.useMemo(() => {
        return ob$ instanceof rxjs.Subject && onlyAfter && ob$.hasError;
    }, [ob$, onlyAfter]);
    React.useEffect(() => {
        if (ignore)
            return;
        const subscription = ob$.subscribe({
            error: (err) => {
                setError(err);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [ob$, ignore]);
    return error;
}

exports.ServiceConsumer = ServiceConsumer;
exports.ServiceInjector = ServiceInjector;
exports.useBehaviorChange = useBehaviorChange;
exports.useBehaviorState = useBehaviorState;
exports.useGetService = useGetService;
exports.useObservableChange = useObservableChange;
exports.useObservableError = useObservableError;
exports.useObservableState = useObservableState;
exports.useService = useService;
exports.useServices = useServices;
exports.withInjector = withInjector;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) exports[k] = core[k];
});
