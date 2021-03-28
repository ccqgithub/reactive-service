'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@reactive-service/core');
var React = require('react');
var rxjs = require('rxjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const ServiceContext = React.createContext(new core.Injector());
const ServiceProvider = (props) => {
    const parentInjector = React.useContext(ServiceContext);
    const { providers = [], children } = props;
    const injector = new core.Injector(providers, parentInjector);
    return (React__default.createElement(ServiceContext.Provider, { value: injector }, children));
};
const ServiceConsumer = (props) => {
    const parentInjector = React.useContext(ServiceContext);
    const getService = (provide) => parentInjector.get(provide);
    const { provides = [] } = props;
    const services = provides.map((provide) => getService(provide));
    return typeof props.children === 'function'
        ? props.children({ services, getService })
        : props.children;
};

function useGetService() {
    const provider = React.useContext(ServiceContext);
    const getService = React.useCallback((provide) => {
        return provider.get(provide);
    }, [provider]);
    return getService;
}
function useService(provide) {
    const getService = useGetService();
    return getService(provide);
}
function useServices(provides) {
    const getService = useGetService();
    return provides.map((provide) => getService(provide));
}
function useObservable(ob$, defaultValue) {
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
exports.ServiceContext = ServiceContext;
exports.ServiceProvider = ServiceProvider;
exports.useGetService = useGetService;
exports.useObservable = useObservable;
exports.useObservableError = useObservableError;
exports.useService = useService;
exports.useServices = useServices;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) exports[k] = core[k];
});
