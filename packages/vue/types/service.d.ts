import { Observable, Subject, PartialObserver } from 'rxjs';
import { Disposable, InjectionClass, InjectionContext } from './core';
declare type Actions<A extends Record<string, any>> = {
    [P in keyof A]: Subject<A[P]>;
};
declare type Events<E extends Record<string, any>> = {
    [P in keyof E]: Subject<E[P]>;
};
declare type Mutation<S> = (state: S, payload: any) => void;
declare type Payload<M, K extends keyof M> = M[K] extends (state: any, p: infer P) => any ? P : never;
declare type Options<S extends Record<string, any>, A extends Record<string, any>, E extends Record<string, any>, M extends Record<string, Mutation<S>>> = {
    name?: string;
    strict?: boolean;
    state?: S;
    mutations?: M;
    actions?: (keyof A)[];
    events?: (keyof E)[];
    setup?: (ctx: {
        state: S;
        $actions: Actions<A>;
        $events: Events<E>;
        commit: (key: keyof M, payload: Payload<M, keyof M>) => void;
        subscribe: <T = any>(ob: Observable<T>, observer?: PartialObserver<T>) => void;
        dispatch: <K extends keyof A>(key: K, v: A[K]) => void;
        emit: <K extends keyof E>(key: K, v: E[K]) => void;
        on: <K extends keyof E>(key: K, fn: (v: E[K]) => void) => void;
    }) => void;
};
export declare class Service<S extends Record<string, any> = {}, A extends Record<string, any> = {}, E extends Record<string, any> = {}, M extends Record<string, Mutation<S>> = {}> extends Disposable implements InjectionClass {
    private _vm;
    private mutations;
    private isCommitting;
    private app;
    name: string;
    $actions: Actions<A>;
    $events: Events<E>;
    constructor(opts: () => Options<S, A, E, M>, ctx: InjectionContext);
    get state(): S;
    subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void;
    commit(key: keyof M, payload: Payload<M, keyof M>): void;
    dispatch<K extends keyof A>(key: K, v: A[K]): void;
    emit<K extends keyof E>(key: K, v: E[K]): void;
    on<K extends keyof E>(key: K, fn: (v: E[K]) => void): void;
}
declare type ServiceClass<S extends Record<string, any> = {}, A extends Record<string, any> = {}, E extends Record<string, any> = {}, M extends Record<string, Mutation<S>> = {}> = new (ctx: InjectionContext) => Service<S, A, E, M>;
export declare function createService<S extends Record<string, any> = {}, A extends Record<string, any> = {}, E extends Record<string, any> = {}, M extends Record<string, Mutation<S>> = {}>(options: () => Options<S, A, E, M>): ServiceClass<S, A, E, M>;
export {};
//# sourceMappingURL=service.d.ts.map