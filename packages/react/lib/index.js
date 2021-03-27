"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useServices = exports.useService = exports.useObservableError = exports.useObservable = exports.useGetService = exports.ServiceConsumer = exports.ServiceProvider = exports.ServiceContext = void 0;
__exportStar(require("@reactive-service/core"), exports);
__exportStar(require("./types"), exports);
var context_1 = require("./context");
Object.defineProperty(exports, "ServiceContext", { enumerable: true, get: function () { return context_1.ServiceContext; } });
Object.defineProperty(exports, "ServiceProvider", { enumerable: true, get: function () { return context_1.ServiceProvider; } });
Object.defineProperty(exports, "ServiceConsumer", { enumerable: true, get: function () { return context_1.ServiceConsumer; } });
var use_1 = require("./use");
Object.defineProperty(exports, "useGetService", { enumerable: true, get: function () { return use_1.useGetService; } });
Object.defineProperty(exports, "useObservable", { enumerable: true, get: function () { return use_1.useObservable; } });
Object.defineProperty(exports, "useObservableError", { enumerable: true, get: function () { return use_1.useObservableError; } });
Object.defineProperty(exports, "useService", { enumerable: true, get: function () { return use_1.useService; } });
Object.defineProperty(exports, "useServices", { enumerable: true, get: function () { return use_1.useServices; } });
