import { Injector, debug } from '@reactive-service/core';
export * from '@reactive-service/core';
import React, { createContext, useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';

const ServiceContext = createContext(new Injector());
const ServiceProvider = (props) => {
    const parentInjector = useContext(ServiceContext);
    const { providers = [], children } = props;
    const injector = new Injector(providers, parentInjector);
    return (React.createElement(ServiceContext.Provider, { value: injector }, children));
};
const ServiceConsumer = (props) => {
    const injector = useContext(ServiceContext);
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

function useGetService() {
    const provider = useContext(ServiceContext);
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

export { ServiceConsumer, ServiceContext, ServiceProvider, useGetService, useObservable, useObservableError, useService, useServices };
