"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
// service injector
var Injector = /** @class */ (function () {
    function Injector(providers, parent) {
        var _this = this;
        if (providers === void 0) { providers = []; }
        if (parent === void 0) { parent = null; }
        // 父 injector
        this.parent = null;
        // 当前 injector 上的服务记录
        this.records = new Map();
        this.parent = parent;
        // provider records
        providers.forEach(function (provider) {
            var record;
            var provide;
            if (typeof provider === 'object' &&
                typeof provider.provide !== 'undefined' &&
                (provider.useClass || provider.useValue)) {
                provide = provider.provide;
                record = {
                    value: provider.useValue || null,
                    useClass: provider.useClass || null,
                    dispose: provider.dispose || null
                };
            }
            else if (typeof provider === 'function') {
                provide = provider;
                record = {
                    value: null,
                    useClass: provider,
                    dispose: null
                };
            }
            else {
                config_1.debug(provider);
                throw new Error('Error provider onfig!');
            }
            _this.records.set(provide, record);
        });
    }
    Injector.prototype.isRegistered = function (provide) {
        if (this.records.has(provide))
            return true;
        if (this.parent)
            return this.parent.isRegistered(provide);
        return false;
    };
    Injector.prototype.get = function (provide) {
        var record = this.records.get(provide);
        if (!record) {
            config_1.debug(provide);
            throw new Error("The service not be registered on this injector or any of the parent injector!");
        }
        if (!record.value) {
            // 如果没有 value，则一定有 useClass
            record.value = this.$_initClass(record.useClass);
        }
        return record.value;
    };
    Injector.prototype.$_initClass = function (useClass) {
        var _this = this;
        // 实例化类的时候，绑定一个parent injector（this injector），这样的话，这个类在内部依赖其他服务的时候，就能使用它
        var lastGetParentInjector = useClass.prototype.$_getParentInjector || null;
        useClass.prototype.$_getParentInjector = function () {
            return _this;
        };
        var instance = new useClass();
        instance.$_parentInjector = this;
        useClass.prototype.$_getParentInjector = lastGetParentInjector;
        return instance;
    };
    Injector.prototype.dispose = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.records), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), record = _d[1];
                if (record.dispose) {
                    record.dispose(record.value);
                }
                else if (typeof record.dispose === 'function') {
                    record.dispose();
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.parent = null;
        this.records.clear();
    };
    // 在服务内获取父Injector
    Injector.getParentInjector = function (instance) {
        var parentInjector = null;
        if (typeof instance.$_parentInjector === 'object') {
            parentInjector = instance.$_parentInjector;
        }
        else if (typeof instance.$_getParentInjector === 'function') {
            parentInjector = instance.$_getParentInjector(instance);
        }
        return parentInjector;
    };
    return Injector;
}());
exports.default = Injector;
