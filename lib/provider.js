"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// service provider
var Provider = /** @class */ (function () {
    function Provider(configs, parent) {
        if (configs === void 0) { configs = {}; }
        if (parent === void 0) { parent = null; }
        // 父 provider
        this.parent = null;
        // 当前 provider 上的服务实例
        this.services = {};
        // 当前 provider 配置
        this.configs = {};
        this.configs = configs;
        this.parent = parent;
    }
    Provider.prototype.isRegistered = function (name) {
        var names = Object.keys(this.configs);
        if (names.indexOf(name) !== -1)
            return true;
        if (this.parent)
            return this.parent.isRegistered(name);
        return false;
    };
    Provider.prototype.get = function (name) {
        var names = Object.keys(this.configs);
        if (names.indexOf(name) !== -1) {
            if (!this.services[name]) {
                this.init(name);
            }
            return this.services[name];
        }
        var service = this.parent ? this.parent.get(name) : null;
        if (!service) {
            throw new Error("The service[" + name + "] not be registered on this provider or any of the parent provider!");
        }
        return service;
    };
    Provider.prototype.dispose = function () {
        var _this = this;
        var names = Object.keys(this.configs);
        names.forEach(function (name) {
            var service = _this.services[name];
            if (service)
                service.dispose();
        });
        this.parent = null;
        this.services = {};
        this.configs = {};
    };
    Provider.prototype.init = function (name) {
        var config = this.configs[name];
        var service;
        if (typeof config === 'object') {
            if (config.useClass) {
                service = new config.useClass(this);
            }
            else if (config.useInstance) {
                service = config.useInstance(this);
            }
        }
        else if (typeof config === 'function') {
            // type of class is function
            service = new config(this);
        }
        if (!service) {
            throw new Error("Error service config for [" + name + "]");
        }
        this.services[name] = service;
    };
    return Provider;
}());
exports.default = Provider;
