import { UnwrapNestedRefs } from '@vue/reactivity';
import { Observable, Subject, PartialObserver } from 'rxjs';
import { Disposable, InjectionClass } from './core';
export declare type ServiceActions<A extends Record<string, any>> = {
    [P in keyof A]: Subject<A[P]>;
};
export declare type ServiceEvents<E extends Record<string, any>> = {
    [P in keyof E]: Subject<E[P]>;
};
export declare type ServiceOptions<S extends Record<string, any>, A extends Record<string, any>, E extends Record<string, any>> = {
    state?: S;
    actions?: (keyof A)[];
    events?: (keyof E)[];
};
export default class Service<S extends Record<string, any> = {}, A extends Record<string, any> = {}, E extends Record<string, any> = {}> extends Disposable implements InjectionClass {
    displayName: string;
    $: ServiceActions<A>;
    $e: ServiceEvents<E>;
    _state: UnwrapNestedRefs<S>;
    state: import("vue").DeepReadonly<UnwrapNestedRefs<UnwrapNestedRefs<S>>>;
    constructor(args?: ServiceOptions<S, A, E>);
    setState(fn: (state: UnwrapNestedRefs<S>) => void): void;
    subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void;
}
//# sourceMappingURL=service.d.ts.map