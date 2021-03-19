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
exports.useObservable = exports.useServices = exports.useService = exports.useGetService = exports.Consumer = exports.Provider = exports.Context = void 0;
__exportStar(require("@reactive-service/core"), exports);
__exportStar(require("./types"), exports);
var context_1 = require("./context");
Object.defineProperty(exports, "Context", { enumerable: true, get: function () { return context_1.Context; } });
Object.defineProperty(exports, "Provider", { enumerable: true, get: function () { return context_1.Provider; } });
Object.defineProperty(exports, "Consumer", { enumerable: true, get: function () { return context_1.Consumer; } });
var use_1 = require("./use");
Object.defineProperty(exports, "useGetService", { enumerable: true, get: function () { return use_1.useGetService; } });
Object.defineProperty(exports, "useService", { enumerable: true, get: function () { return use_1.useService; } });
Object.defineProperty(exports, "useServices", { enumerable: true, get: function () { return use_1.useServices; } });
Object.defineProperty(exports, "useObservable", { enumerable: true, get: function () { return use_1.useObservable; } });
