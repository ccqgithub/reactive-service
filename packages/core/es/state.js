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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import Disposable from './disposable';
var State = /** @class */ (function (_super) {
    __extends(State, _super);
    function State(initialValue) {
        var _this = _super.call(this) || this;
        _this._state$$ = new BehaviorSubject(initialValue);
        _this.state$$ = _this.select(function (state$$) { return state$$; });
        return _this;
    }
    Object.defineProperty(State.prototype, "state", {
        get: function () {
            return this._state$$.getValue();
        },
        enumerable: false,
        configurable: true
    });
    State.prototype.select = function (mapFn) {
        var newValue$$ = new BehaviorSubject(mapFn(this.state));
        var subscription = this._state$$
            .pipe(map(function (state) { return mapFn(state); }), distinctUntilChanged())
            .subscribe(newValue$$);
        this.beforeDispose(subscription.unsubscribe);
        return newValue$$;
    };
    State.prototype.selectAsObservable = function (mapFn) {
        return this._state$$.asObservable().pipe(map(function (state) { return mapFn(state); }), distinctUntilChanged());
    };
    State.prototype.setState = function (stateOrMutation) {
        var newState = typeof stateOrMutation === 'function'
            ? stateOrMutation(this.state)
            : stateOrMutation;
        this._state$$.next(__assign(__assign({}, this.state), newState));
    };
    return State;
}(Disposable));
export default State;
