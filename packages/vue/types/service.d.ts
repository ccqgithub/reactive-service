import { Observable, Subject, PartialObserver } from 'rxjs';
import { Disposable, InjectionClass, InjectionContext } from './core';
declare type Actions<A extends Record<string, any>> = {
    [P in keyof A]: Subject<A[P]>;
};
declare type Events<E extends Record<string, any>> = {
    [P in keyof E]: Subject<E[P]>;
};
declare type Mutation<S> = (state: S, payload: any) => void;
declare type MS<S, M> = M & {
    setStateByPath: (state: S, args: {
        path: string;
        value: any;
    }) => void;
};
declare type Options<S extends Record<string, any>, A extends Record<string, any>, E extends Record<string, any>, M extends Record<string, Mutation<S>>> = {
    name?: string;
    strict?: boolean;
    state?: S;
    mutations?: M;
    actions?: (keyof A)[];
    events?: (keyof E)[];
};
export default abstract class Service<S extends Record<string, any> = {}, A extends Record<string, any> = {}, E extends Record<string, any> = {}, M extends Record<string, Mutation<S>> = {}> extends Disposable implements InjectionClass {
    private _vm;
    private mutations;
    private isCommitting;
    private app;
    name: string;
    $actions: Actions<A>;
    $events: Events<E>;
    abstract options(): Options<S, A, E, M>;
    constructor(ctx: InjectionContext);
    get state(): S;
    subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void;
    commit<K extends keyof MS<S, M>>(key: K, payload: Parameters<MS<S, M>[K]>[1]): void;
    dispatch<K extends keyof A>(key: K, v: A[K]): void;
    emit<K extends keyof E>(key: K, v: E[K]): void;
    on<K extends keyof E>(key: K, fn: (v: E[K]) => void): void;
    vModel(path: string): import("vue").WritableComputedRef<any>;
}
export {};
//# sourceMappingURL=service.d.ts.map