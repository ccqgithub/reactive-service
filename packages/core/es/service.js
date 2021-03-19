var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import Injector from './injector';
import State from './state';
// Service 服务基类
var Service = /** @class */ (function (_super) {
    __extends(Service, _super);
    function Service(initialState, providers) {
        if (providers === void 0) { providers = []; }
        var _this = _super.call(this, initialState) || this;
        // provide services
        _this.$_injector = new Injector(providers, Injector.getParentInjector(_this));
        _this.beforeDispose(function () {
            _this.$_injector.dispose();
        });
        return _this;
    }
    Service.prototype.subscribe = function (ob$) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var subscription = ob$.subscribe.apply(ob$, __spreadArray([], __read(args)));
        this.beforeDispose(function () {
            subscription.unsubscribe();
        });
    };
    Service.prototype.getService = function (provide) {
        var injector = this.$_injector;
        return injector.get(provide);
    };
    return Service;
}(State));
export default Service;
