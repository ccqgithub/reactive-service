import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { PartialObserver } from 'rxjs';
import { Subject } from 'rxjs';

export declare const config: (args: Partial<ConfigArgs>) => void;

declare type ConfigArgs = {
    logLevel: LogLevel;
    log: LogFunction;
};

export declare const debug: (msg: unknown, type?: LogType, condition?: boolean) => void;

export declare class Disposable {
    private $_disposers;
    protected beforeDispose(disposer: Disposer): void;
    dispose(): void;
}

declare type Disposer = () => void;

export declare interface GetService {
    <P extends InjectionProvide>(provide: P, opts: {
        optional: true;
    }): InjectionValue<P> | null;
    <P extends InjectionProvide>(provide: P, opts?: {
        optional?: false;
    }): InjectionValue<P>;
}

export declare type InjectionAbstractConstructor<T = InjectionClass> = Function & {
    prototype: T;
};

export declare type InjectionClass = Record<string, any>;

export declare type InjectionConstructor<T = InjectionClass> = {
    new (...args: any[]): T;
};

export declare type InjectionContext = {
    useService: GetService;
};

export declare type InjectionDisposer = <P extends InjectionProvide = InjectionProvide>(service: InjectionValue<P>) => void;

export declare type InjectionProvide = InjectionToken | InjectionConstructor | InjectionAbstractConstructor;

export declare type InjectionProvider = InjectionProvide | InjectionProviderObj;

export declare type InjectionProviderObj = {
    provide: InjectionProvide;
    useValue?: any;
    useClass?: InjectionConstructor | null;
    useExisting?: InjectionProvide | null;
    useFactory?: ((ctx: InjectionContext) => InjectionValue<InjectionProvide>) | null;
    dispose?: InjectionDisposer | null;
};

export declare class InjectionToken<V = any> {
    private _desc;
    factory?: ((ctx: InjectionContext) => V) | null;
    constructor(desc: string, options?: {
        factory: (ctx: InjectionContext) => V;
    });
    toString(): string;
}

export declare type InjectionValue<P extends InjectionProvide> = P extends InjectionToken<infer V> ? V : P extends {
    prototype: infer C;
} ? C : never;

export declare class Injector {
    private parent;
    private records;
    constructor(providers?: InjectionProvider[], parent?: Injector | null);
    isProvided(provide: InjectionProvide): boolean;
    get<P extends InjectionProvide>(provide: P, args: {
        optional: true;
    }): InjectionValue<P> | null;
    get<P extends InjectionProvide>(provide: P, args?: {
        optional?: false;
    }): InjectionValue<P>;
    private $_initRecord;
    dispose(): void;
}

declare type LogFunction = (msg: any, type: LogType) => void;

declare type LogLevel = 'info' | 'warn' | 'error' | 'never';

declare type LogType = 'info' | 'warn' | 'error';

export declare class Service<S extends Record<string, any> = {}, A extends Record<string, any> = {}, E extends Record<string, any> = {}> extends Disposable implements InjectionClass {
    displayName: string;
    $$: ServiceState<S>;
    $: ServiceActions<A>;
    $e: ServiceEvents<E>;
    get state(): S;
    constructor(args?: ServiceOptions<S, A, E>);
    subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void;
    subscribe<T = any>(ob: Observable<T>, next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): void;
}

declare type ServiceActions<A extends Record<string, any>> = {
    [P in keyof A]: Subject<A[P]>;
};

declare type ServiceEvents<E extends Record<string, any>> = {
    [P in keyof E]: Subject<E[P]>;
};

declare type ServiceOptions<S extends Record<string, any>, A extends Record<string, any>, E extends Record<string, any>> = {
    state?: S;
    actions?: (keyof A)[];
    events?: (keyof E)[];
};

declare type ServiceState<S extends Record<string, any>> = {
    [P in keyof S]: BehaviorSubject<S[P]>;
};

export { }
