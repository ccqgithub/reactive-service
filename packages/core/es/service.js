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
import { BehaviorSubject, Subject } from 'rxjs';
import Disposable from './disposable';
import Injector from './injector';
import { debug } from './util';
// Service 服务基类
var Service = /** @class */ (function (_super) {
    __extends(Service, _super);
    function Service(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        // displayName, for debug
        _this.displayName = '';
        // notify sources
        _this.$$ = {};
        // actions
        _this.$ = {};
        // provide services
        _this.$_injector = new Injector(args.providers || [], Injector.getParentInjector(_this));
        _this.beforeDispose(function () {
            _this.$_injector.dispose();
        });
        // displayName
        if (!_this.displayName) {
            _this.displayName = _this.constructor.name;
            debug("[Service " + _this.displayName + "]: For better debugging, you'd better add an attribute 'displayName' to each service class.", 'warn');
        }
        // init state
        var initialState = (args.state || {});
        Object.keys(initialState).forEach(function (key) {
            _this.$$[key] = new BehaviorSubject(initialState[key]);
        });
        // init actions
        var actions = args.actions || [];
        actions.forEach(function (key) {
            _this.$[key] = new Subject();
        });
        // debugs: update state
        Object.keys(_this.$$).forEach(function (key) {
            _this.useSubscribe(_this.$$[key], {
                next: function (v) {
                    debug("[Service " + _this.displayName + "]: set new state [" + key + "].", 'info');
                    debug(v, 'info');
                }
            });
        });
        // debugs: new action
        Object.keys(_this.$).forEach(function (key) {
            _this.useSubscribe(_this.$[key], {
                next: function (v) {
                    debug("[Service " + _this.displayName + "]: receive new action [" + key + "].", 'info');
                    debug(v, 'info');
                }
            });
        });
        return _this;
    }
    Object.defineProperty(Service.prototype, "state", {
        // state
        get: function () {
            var _this = this;
            var state = {};
            Object.keys(this.$$).forEach(function (key) {
                state[key] = _this.$$[key].value;
            });
            return state;
        },
        enumerable: false,
        configurable: true
    });
    Service.prototype.useService = function (provide) {
        var injector = this.$_injector;
        return injector.get(provide);
    };
    Service.prototype.useSubscribe = function (ob) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var subscription = ob.subscribe.apply(ob, __spreadArray([], __read(args)));
        this.beforeDispose(function () {
            subscription.unsubscribe();
        });
    };
    return Service;
}(Disposable));
export default Service;
