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
import { useCallback, useContext, useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Context } from './context';
export function useGetService() {
    var provider = useContext(Context);
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
    if (defaultValue === void 0) { defaultValue = undefined; }
    var _a = __read(useState(function () {
        if (ob$ instanceof BehaviorSubject)
            return ob$.value;
        return defaultValue;
    }), 2), state = _a[0], setState = _a[1];
    useEffect(function () {
        var subscription = ob$.subscribe({
            next: function (v) { return setState(v); },
            error: function (err) {
                throw err;
            }
        });
        return function () {
            subscription.unsubscribe();
        };
    }, [ob$]);
    return state;
}
