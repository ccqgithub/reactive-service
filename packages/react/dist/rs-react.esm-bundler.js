import { Injector, debug } from '@reactive-service/core';
export * from '@reactive-service/core';
import React, { createContext, useContext, forwardRef, useState, useRef, useCallback, useEffect } from 'react';
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

function useRSRef(value) {
    const [state, setState] = useState(value);
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
    const ref = useRef(value);
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
    const provider = useContext(InjectorContext);
    const getService = useCallback((provide) => {
        return provider.get(provide);
    }, [provider]);
    return getService;
}
function useService(provide) {
    const getService = useGetService();
    const service = getService(provide);
    return service;
}
function useObservable(ob$, defaultValue) {
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
}
function useBehavior(ob$) {
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
}
function useObservableError(ob$, onlyAfter = false) {
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
}
function useListenValue(value, listner) {
    const ref = useRef(listner);
    ref.current = listner;
    useEffect(() => {
        ref.current(value);
    }, [value]);
}

export { ServiceConsumer, ServiceInjector, useBehavior, useGetService, useListenValue, useObservable, useObservableError, useRSRef, useService, useValueRef, withInjector };
