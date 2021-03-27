var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Subject, BehaviorSubject } from 'rxjs';
import { ServiceContext } from './context';
export function useGetService() {
    var provider = useContext(ServiceContext);
    var getService = useCallback(function (provide) {
        return provider.get(provide);
    }, [provider]);
    return getService;
}
export function useService(provide) {
    var getService = useGetService();
    return getService(provide);
}
export function useServices(provides) {
    var getService = useGetService();
    return provides.map(function (provide) { return getService(provide); });
}
export function useObservable(ob$, defaultValue) {
    var _a = __read(useState(function () {
        if (ob$ instanceof BehaviorSubject)
            return ob$.value;
        return defaultValue;
    }), 2), state = _a[0], setState = _a[1];
    useEffect(function () {
        var subscription = ob$.subscribe({
            next: function (v) { return setState(v); }
        });
        return function () {
            subscription.unsubscribe();
        };
    }, [ob$]);
    return state;
}
export function useObservableError(ob$, onlyAfter) {
    if (onlyAfter === void 0) { onlyAfter = false; }
    var _a = __read(useState(null), 2), error = _a[0], setError = _a[1];
    var ignore = useMemo(function () {
        return ob$ instanceof Subject && onlyAfter && ob$.hasError;
    }, [ob$, onlyAfter]);
    useEffect(function () {
        if (ignore)
            return;
        var subscription = ob$.subscribe({
            error: function (err) {
                setError(err);
            }
        });
        return function () {
            subscription.unsubscribe();
        };
    }, [ob$, ignore]);
    return error;
}
