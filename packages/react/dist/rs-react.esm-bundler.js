import { Injector, debug } from '@reactive-service/core';
export * from '@reactive-service/core';
import React, { createContext, useContext, forwardRef, useCallback, useState, useEffect, useMemo } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { BehaviorSubject, Subject } from 'rxjs';

const InjectorContext = createContext(new Injector());
const ServiceInjector = (props) => {
    const parentInjector = useContext(InjectorContext);
    const { providers = [], children } = props;
    const injector = new Injector(providers, parentInjector);
    return (React.createElement(InjectorContext.Provider, { value: injector }, children));
};
const ServiceConsumer = (props) => {
    const injector = useContext(InjectorContext);
    const getService = (provide, opts = {}) => {
        const { optional = false } = opts;
        const service = injector.get(provide);
        if (!service && !optional) {
            debug(provide, 'error');
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
        const Comp = forwardRef((props, ref) => {
            return (React.createElement(ServiceInjector, { providers: args.providers },
                React.createElement(Component, Object.assign({ ref: ref }, props))));
        });
        Comp.displayName = displayName;
        return hoistStatics(Comp, Component);
    };
};

function useGetService() {
    const provider = useContext(InjectorContext);
    const getService = useCallback((provide) => {
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
function useObservable(ob$, defaultValue) {
    const [state, setState] = useState(() => {
        if (ob$ instanceof BehaviorSubject)
            return ob$.value;
        return defaultValue;
    });
    useEffect(() => {
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
    const [error, setError] = useState(null);
    const ignore = useMemo(() => {
        return ob$ instanceof Subject && onlyAfter && ob$.hasError;
    }, [ob$, onlyAfter]);
    useEffect(() => {
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

export { ServiceConsumer, ServiceInjector, useGetService, useObservable, useObservableError, useService, useServices, withInjector };
