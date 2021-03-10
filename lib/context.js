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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumer = exports.Provider = exports.Context = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var provider_1 = __importDefault(require("./provider"));
var Context = react_1.createContext(new provider_1.default());
exports.Context = Context;
var Provider = function (props) {
    var parentProvider = react_1.useContext(Context);
    var services = props.services;
    var provider = new provider_1.default(services, parentProvider);
    return jsx_runtime_1.jsx(Context.Provider, __assign({ value: provider }, { children: props.children }), void 0);
};
exports.Provider = Provider;
var Consumer = function (props) {
    var parentProvider = react_1.useContext(Context);
    var getService = function (key) { return parentProvider.get(key); };
    return props.children({ getService: getService });
};
exports.Consumer = Consumer;
