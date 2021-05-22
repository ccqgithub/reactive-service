'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@reactive-service/core');
var React = require('react');
var rxjs = require('rxjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const InjectorContext = React.createContext(new core.Injector());
const ServiceInjector = (props) => {
    const isFirstRef = React.useRef(true);
    const parentInjector = React.useContext(InjectorContext);
    const { providers = [], children } = props;
    const [injector, setInjector] = React.useState(() => new core.Injector(providers, parentInjector));
    React.useEffect(() => {
        if (isFirstRef.current) {
            isFirstRef.current = false;
            return;
        }
        const injector = new core.Injector(providers, parentInjector);
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

exports.ServiceConsumer = ServiceConsumer;
exports.ServiceInjector = ServiceInjector;
exports.useBehavior = useBehavior;
exports.useGetService = useGetService;
exports.useObservable = useObservable;
exports.useObservableError = useObservableError;
exports.useService = useService;
exports.useSubscribe = useSubscribe;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) exports[k] = core[k];
});
