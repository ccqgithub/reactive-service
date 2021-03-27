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
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { Injector } from '@reactive-service/core';
var ServiceContext = createContext(new Injector());
var ServiceProvider = function (props) {
    var parentInjector = useContext(ServiceContext);
    var _a = props.providers, providers = _a === void 0 ? [] : _a, children = props.children;
    var injector = new Injector(providers, parentInjector);
    return (_jsx(ServiceContext.Provider, __assign({ value: injector }, { children: children }), void 0));
};
var ServiceConsumer = function (props) {
    var parentInjector = useContext(ServiceContext);
    var getService = function (provide) { return parentInjector.get(provide); };
    var _a = props.provides, provides = _a === void 0 ? [] : _a;
    var services = provides.map(function (provide) { return getService(provide); });
    return typeof props.children === 'function'
        ? props.children({ services: services, getService: getService })
        : props.children;
};
export { ServiceContext, ServiceProvider, ServiceConsumer };
