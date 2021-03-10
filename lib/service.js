"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var mobx_1 = require("mobx");
var provider_1 = __importDefault(require("./provider"));
// Service 服务基类
var Service = /** @class */ (function () {
    function Service(parentProvider) {
        var _this = this;
        if (parentProvider === void 0) { parentProvider = null; }
        // clear 时清理的回调函数
        this.$_clearCallbacks = [];
        // sources
        this.sources = {};
        // actions
        this.actions = {};
        // setup options
        var _a = this.setup(), _b = _a.providers, providers = _b === void 0 ? {} : _b, _c = _a.state, state = _c === void 0 ? {} : _c, _d = _a.sources, sources = _d === void 0 ? {} : _d, _e = _a.actions, actions = _e === void 0 ? [] : _e;
        // services
        this.$_serviceProvider = new provider_1.default(providers, parentProvider);
        // data
        this.state = mobx_1.observable(state);
        // sources
        Object.keys(sources).forEach(function (key) {
            var source = sources[key];
            var conf = typeof source === 'string' ? { type: source } : source;
            var params, val, vals;
            switch (conf.type) {
                // subject, no default value
                case 'normal':
                    _this.sources[key] = new rxjs_1.Subject();
                    break;
                // save last value
                case 'behavior':
                    if (typeof conf.default === 'function') {
                        val = conf.default(_this.state);
                    }
                    else {
                        val = conf.default;
                    }
                    _this.sources[key] = new rxjs_1.BehaviorSubject(val);
                    break;
                // replay values
                case 'replay':
                    params = conf.params || {};
                    if (typeof conf.default === 'function') {
                        vals = conf.default(_this.state);
                    }
                    else {
                        vals = conf.default || [];
                    }
                    if (!Array.isArray(vals)) {
                        throw new Error('Default value for replay sourc must be an array!');
                    }
                    _this.sources[key] = new rxjs_1.ReplaySubject(params.bufferSize, params.windowTime);
                    vals.forEach(function (v) {
                        _this.sources[key].next(v);
                    });
                    break;
            }
        });
        // actions
        actions.forEach(function (key) {
            _this.actions[key] = new rxjs_1.Subject();
        });
    }
    Service.prototype.setup = function () {
        return {
            providers: {},
            state: {
            // key: value
            },
            sources: {
            // a: 'normal',
            // b: {
            //   type: 'behavior',
            //   default({ $data }) {
            //     return $data.b;
            //   }
            // },
            // c: {
            //   type: 'replay',
            //   default: () => [1, 2, 3],
            //   params: {
            //     bufferSize: 3,
            //     windowTime: 2000
            //   }
            // }
            },
            actions: [
            // 'a',
            // 'b'
            ]
        };
    };
    Service.prototype.getState = function () {
        return this.state;
    };
    Service.prototype.mutation = function (fn) {
        var _this = this;
        mobx_1.runInAction(function () {
            fn(_this.state);
        });
    };
    Service.prototype.subscribe = function (ob$) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var subscription = ob$.subscribe.apply(ob$, args);
        this.beforeClear(function () {
            subscription.unsubscribe();
        });
    };
    Service.prototype.useService = function (name) {
        var provider = this.$_serviceProvider;
        return provider.get(name);
    };
    // 添加清理回调
    Service.prototype.beforeClear = function (fn) {
        this.$_clearCallbacks.push(fn);
    };
    // 服务类不再使用时，清理
    // 主要用于清理长时间订阅等工作
    // 子类的这个方法里需要调用`super.clear()`
    Service.prototype.dispose = function () {
        // clear service
        this.$_serviceProvider && this.$_serviceProvider.dispose();
        // clear other callbacks
        this.$_clearCallbacks.forEach(function (fn) {
            fn();
        });
        this.$_clearCallbacks = [];
    };
    return Service;
}());
exports.default = Service;
