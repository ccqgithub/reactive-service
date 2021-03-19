"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Disposable = /** @class */ (function () {
    function Disposable() {
        this.$_disposers = [];
    }
    Disposable.prototype.beforeDispose = function (disposer) {
        this.$_disposers.push(disposer);
    };
    Disposable.prototype.dispose = function () {
        this.$_disposers.forEach(function (disposer) {
            disposer();
        });
    };
    return Disposable;
}());
exports.default = Disposable;
