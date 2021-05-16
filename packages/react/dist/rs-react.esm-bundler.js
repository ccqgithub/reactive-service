import { Injector } from '@reactive-service/core';
export * from '@reactive-service/core';
import React, { createContext, useRef, useContext, useState, useEffect, forwardRef, useCallback, useMemo } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { BehaviorSubject, Subject } from 'rxjs';

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

/*
一般测试，或者封装路由组件列表时使用，因为路由列表时显式添加provider不太方便
const WrrappedComponent = () => {};
export default withInjector({
  providers: []
})(WrrappedComponent);
*/
const withInjector = (args) => {
    return function (Component) {
        const displayName = 'withInjector(' + (Component.displayName || Component.name) + ')';
        const Comp = forwardRef((props, ref) => {
            return (React.createElement(ServiceInjector, { providers: args.providers },
                React.createElement(Component, Object.assign({ ref: ref }, props))));
        });
        Comp.displayName = displayName;
        return hoistStatics(Comp, Component);
    };
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
const useObservableError = (ob$, onlyAfter = false) => {
    const [state, setState] = useState(null);
    useEffect(() => {
        const ignore = ob$ instanceof Subject && onlyAfter && ob$.hasError;
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

export { ServiceConsumer, ServiceInjector, useBehavior, useGetService, useObservable, useObservableError, useService, useSubscribe, withInjector };
