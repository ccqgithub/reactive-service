import { Observable, Subject, PartialObserver } from 'rxjs';
import { Disposable, InjectionClass } from './core';
export declare type ServiceActions<A extends Record<string, any>> = {
    [P in keyof A]: Subject<A[P]>;
};
export declare type ServiceEvents<E extends Record<string, any>> = {
    [P in keyof E]: Subject<E[P]>;
};
export declare type ServiceOptions<S extends Record<string, any>, A extends Record<string, any>, E extends Record<string, any>> = {
    data?: S;
    actions?: (keyof A)[];
    events?: (keyof E)[];
};
export default class Service<S extends Record<string, any> = {}, A extends Record<string, any> = {}, E extends Record<string, any> = {}> extends Disposable implements InjectionClass {
    displayName: string;
    $a: ServiceActions<A>;
    $e: ServiceEvents<E>;
    private data;
    $d: import("vue").DeepReadonly<import("@vue/reactivity").UnwrapNestedRefs<import("@vue/reactivity").UnwrapNestedRefs<S>>>;
    constructor(args?: ServiceOptions<S, A, E>);
    subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void;
}
//# sourceMappingURL=service.d.ts.map