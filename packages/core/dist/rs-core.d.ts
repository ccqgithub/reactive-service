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

export declare const empty: unique symbol;

export declare const Inject: <P extends InjectionProvide = InjectionProvide>(provide: P, args?: {
    optional?: boolean;
}) => (target: InjectionConstructor, propertyKey: string | symbol | undefined, parameterIndex: number) => void;

export declare type InjectionClass = Record<string, any>;

export declare type InjectionConstructor = {
    new (...args: any[]): InjectionClass;
};

export declare type InjectionDisposer = <P extends InjectionProvide = InjectionProvide>(service: InjectionValue<P>) => void;

export declare type InjectionGet = <P extends InjectionProvide>(provide: P, opts?: {
    optional?: boolean;
}) => InjectionValue<P> | null;

export declare type InjectionProvide = InjectionToken | InjectionConstructor;

export declare type InjectionProvider = InjectionProvide | InjectionProviderObj;

export declare type InjectionProviderObj = {
    provide: InjectionProvide;
    useValue?: any;
    useClass?: InjectionConstructor | null;
    useExisting?: InjectionProvide | null;
    useFactory?: ((inject: InjectionGet) => InjectionValue<InjectionProvide>) | null;
    dispose?: InjectionDisposer | null;
};

export declare class InjectionToken<V = any> {
    private _desc;
    factory?: ((inject: InjectionGet) => V) | null;
    constructor(desc: string, options?: {
        factory: (inject: InjectionGet) => V;
    });
    toString(): string;
}

export declare type InjectionValue<P extends InjectionProvide> = P extends InjectionToken<infer V> ? V : P extends InjectionConstructor ? InstanceType<P> : never;

export declare class Injector {
    private parent;
    private records;
    constructor(providers?: InjectionProvider[], parent?: Injector | null);
    isProvided(provide: InjectionProvide): boolean;
    get<P extends InjectionProvide>(provide: P): InjectionValue<P> | null;
    private $_initRecord;
    dispose(): void;
}

declare type LogFunction = (msg: any, type: LogType) => void;

declare type LogLevel = 'info' | 'warn' | 'error' | 'never';

declare type LogType = 'info' | 'warn' | 'error';

export declare class Service<S extends Record<string, any> = Record<string, any>, A extends Record<string, any> = Record<string, any>> extends Disposable implements InjectionClass {
    displayName: string;
    $$: ServiceSources<S>;
    $: ServiceActions<A>;
    get state(): S;
    constructor(args?: ServiceOptions<S, A>);
    subscribe<T = any>(ob: Observable<T>, observer?: PartialObserver<T>): void;
    subscribe<T = any>(ob: Observable<T>, next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): void;
}

declare type ServiceActions<A extends Record<string, any>> = {
    [P in keyof A]: Subject<A[P]>;
};

declare type ServiceOptions<S extends Record<string, any>, A extends Record<string, any>> = {
    state?: S;
    actions?: (keyof A)[];
};

declare type ServiceSources<S extends Record<string, any>> = {
    [P in keyof S]: BehaviorSubject<S[P]>;
};

export { }
