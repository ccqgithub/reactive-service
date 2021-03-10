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
import ServiceProvider from './provider';
var Context = createContext(new ServiceProvider());
var Provider = function (props) {
    var parentProvider = useContext(Context);
    var services = props.services;
    var provider = new ServiceProvider(services, parentProvider);
    return _jsx(Context.Provider, __assign({ value: provider }, { children: props.children }), void 0);
};
var Consumer = function (props) {
    var parentProvider = useContext(Context);
    var getService = function (key) { return parentProvider.get(key); };
    return props.children({ getService: getService });
};
export { Context, Provider, Consumer };
