"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceConsumer = exports.ServiceProvider = exports.ServiceContext = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var core_1 = require("@reactive-service/core");
var ServiceContext = react_1.createContext(new core_1.Injector());
exports.ServiceContext = ServiceContext;
var ServiceProvider = function (props) {
    var parentInjector = react_1.useContext(ServiceContext);
    var _a = props.providers, providers = _a === void 0 ? [] : _a, children = props.children;
    var injector = new core_1.Injector(providers, parentInjector);
    return (jsx_runtime_1.jsx(ServiceContext.Provider, __assign({ value: injector }, { children: children }), void 0));
};
exports.ServiceProvider = ServiceProvider;
var ServiceConsumer = function (props) {
    var parentInjector = react_1.useContext(ServiceContext);
    var getService = function (provide) { return parentInjector.get(provide); };
    var _a = props.provides, provides = _a === void 0 ? [] : _a;
    var services = provides.map(function (provide) { return getService(provide); });
    return typeof props.children === 'function'
        ? props.children({ services: services, getService: getService })
        : props.children;
};
exports.ServiceConsumer = ServiceConsumer;
