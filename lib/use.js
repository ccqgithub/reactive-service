"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCompute = exports.useSubscribe = exports.useServices = exports.useService = exports.useGetService = void 0;
var mobx_1 = require("mobx");
var react_1 = require("react");
var context_1 = require("./context");
function useGetService() {
    var provider = react_1.useContext(context_1.Context);
    var getService = react_1.useCallback(function (name) {
        return provider.get(name);
    }, [provider]);
    return getService;
}
exports.useGetService = useGetService;
function useService(name) {
    var getService = useGetService();
    return getService(name);
}
exports.useService = useService;
function useServices(names) {
    var getService = useGetService();
    var services = {};
    names.forEach(function (name) {
        services[name] = getService(name);
    });
    return services;
}
exports.useServices = useServices;
function useSubscribe() {
    var subscriptions = react_1.useRef([]);
    var subscribe = react_1.useCallback(function (ob$) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var subscription = ob$.subscribe.apply(ob$, args);
        subscriptions.current.push(subscription);
    }, [subscriptions]);
    react_1.useEffect(function () {
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
exports.useSubscribe = useSubscribe;
function useCompute(computeFunc) {
    var getService = useGetService();
    // computed state
    var _a = react_1.useState(function () {
        var initialState = computeFunc({ getService: getService });
        return initialState;
    }), state = _a[0], setState = _a[1];
    // 忽略第一次autorun，因为第一次留给了useState
    var firstRun = react_1.useRef(true);
    react_1.useEffect(function () {
        var disposer = mobx_1.autorun(function () {
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
exports.useCompute = useCompute;
