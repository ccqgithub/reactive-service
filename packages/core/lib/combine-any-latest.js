"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
function combineAnyLatest(sources) {
    if (sources === void 0) { sources = []; }
    return new rxjs_1.Observable(function (observer) {
        var complete = 0;
        var values = sources.map(function () { return undefined; });
        var subscriptions = sources.map(function (source, index) {
            return source.subscribe({
                next: function (v) {
                    values[index] = v;
                    observer.next(values);
                },
                error: function (err) { return observer.error(err); },
                complete: function () {
                    complete++;
                    if (complete === sources.length) {
                        observer.complete();
                    }
                }
            });
        });
        return function () {
            subscriptions.forEach(function (subscription) {
                subscription.unsubscribe();
            });
        };
    });
}
exports.default = combineAnyLatest;
