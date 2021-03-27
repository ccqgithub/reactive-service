"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useObservableError = exports.useObservable = exports.useServices = exports.useService = exports.useGetService = void 0;
var react_1 = require("react");
var rxjs_1 = require("rxjs");
var context_1 = require("./context");
function useGetService() {
    var provider = react_1.useContext(context_1.ServiceContext);
    var getService = react_1.useCallback(function (provide) {
        return provider.get(provide);
    }, [provider]);
    return getService;
}
exports.useGetService = useGetService;
function useService(provide) {
    var getService = useGetService();
    return getService(provide);
}
exports.useService = useService;
function useServices(provides) {
    var getService = useGetService();
    return provides.map(function (provide) { return getService(provide); });
}
exports.useServices = useServices;
function useObservable(ob$, defaultValue) {
    var _a = __read(react_1.useState(function () {
        if (ob$ instanceof rxjs_1.BehaviorSubject)
            return ob$.value;
        return defaultValue;
    }), 2), state = _a[0], setState = _a[1];
    react_1.useEffect(function () {
        var subscription = ob$.subscribe({
            next: function (v) { return setState(v); }
        });
        return function () {
            subscription.unsubscribe();
        };
    }, [ob$]);
    return state;
}
exports.useObservable = useObservable;
function useObservableError(ob$, onlyAfter) {
    if (onlyAfter === void 0) { onlyAfter = false; }
    var _a = __read(react_1.useState(null), 2), error = _a[0], setError = _a[1];
    var ignore = react_1.useMemo(function () {
        return ob$ instanceof rxjs_1.Subject && onlyAfter && ob$.hasError;
    }, [ob$, onlyAfter]);
    react_1.useEffect(function () {
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
exports.useObservableError = useObservableError;
