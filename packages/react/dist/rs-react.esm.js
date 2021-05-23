import { Injector } from '@reactive-service/core';
export * from '@reactive-service/core';
import React, { createContext, useRef, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { BehaviorSubject } from 'rxjs';

const InjectorContext = createContext(new Injector());
const ServiceInjector = (props) => {
    const isFirstRef = useRef(true);
    const parentInjector = useContext(InjectorContext);
    const { providers = [], children } = props;
    const [injector, setInjector] = useState(() => new Injector(providers, parentInjector));
    useEffect(() => {
        if (isFirstRef.current) {
            isFirstRef.current = false;
            return;
        }
        const injector = new Injector(providers, parentInjector);
        setInjector(injector);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providers, parentInjector]);
    return (React.createElement(InjectorContext.Provider, { value: injector }, children));
};
const ServiceConsumer = (props) => {
    const injector = useContext(InjectorContext);
    const getService = (provide, opts) => {
        return injector.get(provide, opts);
    };
    return typeof props.children === 'function'
        ? props.children({ getService })
        : props.children;
};

const useGetService = () => {
    const provider = useContext(InjectorContext);
    const getService = useCallback((provide, opts) => {
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
    const [state, setState] = useState(defaultValue);
    useEffect(() => {
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
    if (!(ob$ instanceof BehaviorSubject)) {
        throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
    }
    const [state, setState] = useState(ob$.value);
    useEffect(() => {
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
    const [state, setState] = useState(defaultValue);
    useEffect(() => {
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
    const args = useMemo(() => {
        if (typeof next === 'object' && next !== null) {
            return next;
        }
        return {
            next,
            error,
            complete
        };
    }, [next, error, complete]);
    const argsRef = useRef(args);
    argsRef.current = args;
    useEffect(() => {
        const subscription = ob$.subscribe((v) => argsRef.current.next && argsRef.current.next(v), (err) => argsRef.current.error && argsRef.current.error(err), () => argsRef.current.complete && argsRef.current.complete());
        return () => {
            subscription.unsubscribe();
        };
    }, [ob$, argsRef]);
}

export { ServiceConsumer, ServiceInjector, useBehavior, useGetService, useObservable, useObservableError, useService, useSubscribe };
