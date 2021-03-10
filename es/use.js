import { autorun } from 'mobx';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Context } from './context';
export function useGetService() {
    var provider = useContext(Context);
    var getService = useCallback(function (name) {
        return provider.get(name);
    }, [provider]);
    return getService;
}
export function useService(name) {
    var getService = useGetService();
    return getService(name);
}
export function useServices(names) {
    var getService = useGetService();
    var services = {};
    names.forEach(function (name) {
        services[name] = getService(name);
    });
    return services;
}
export function useSubscribe() {
    var subscriptions = useRef([]);
    var subscribe = useCallback(function (ob$) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var subscription = ob$.subscribe.apply(ob$, args);
        subscriptions.current.push(subscription);
    }, [subscriptions]);
    useEffect(function () {
        var subs = subscriptions.current;
        return function () {
            subs.forEach(function (subscription) {
                subscription.unsubscribe();
            });
            subscriptions.current = [];
        };
    }, [subscriptions]);
    return subscribe;
}
export function useCompute(computeFunc) {
    var getService = useGetService();
    // computed state
    var _a = useState(function () {
        var initialState = computeFunc({ getService: getService });
        return initialState;
    }), state = _a[0], setState = _a[1];
    // 忽略第一次autorun，因为第一次留给了useState
    var firstRun = useRef(true);
    useEffect(function () {
        var disposer = autorun(function () {
            var val = computeFunc({ getService: getService });
            if (!firstRun.current)
                setState(val);
        });
        firstRun.current = false;
        return function () {
            disposer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getService, computeFunc]);
    return state;
}
