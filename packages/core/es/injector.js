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
import { debug } from './util';
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
                // provider is a config object
                provide = provider.provide;
                record = {
                    value: provider.useValue || null,
                    useClass: provider.useClass || null,
                    dispose: provider.dispose || null
                };
            }
            else if (typeof provider === 'function') {
                // provider is a class
                provide = provider;
                record = {
                    value: null,
                    useClass: provider,
                    dispose: null
                };
            }
            else {
                // error provider config
                debug(provider);
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
        var service;
        if (record && !record.value && record.useClass) {
            service = this.$_initClass(record.useClass);
            record.value = service;
        }
        if (!record || !record.value) {
            debug(provide, 'error');
            throw new Error("The service not be registered on this injector or any of the parent injector!");
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
        var service = new useClass();
        service.$_parentInjector = this;
        service.$_getParentInjector = null;
        useClass.prototype.$_getParentInjector = lastGetParentInjector;
        return service;
    };
    Injector.prototype.dispose = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.records), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), record = _d[1];
                if (!record.value)
                    return;
                if (record.dispose) {
                    record.dispose(record.value);
                }
                else if (typeof record.value.dispose === 'function') {
                    record.value.dispose(record.value);
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
    Injector.getParentInjector = function (service) {
        var parentInjector = null;
        if (typeof service.$_parentInjector === 'object') {
            // 实例已经创建时
            parentInjector = service.$_parentInjector;
        }
        else if (typeof service.$_getParentInjector === 'function') {
            // 还在执行构造函数中时
            parentInjector = service.$_getParentInjector(service);
        }
        return parentInjector;
    };
    return Injector;
}());
export default Injector;
