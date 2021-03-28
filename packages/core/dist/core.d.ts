import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

export declare const config: (args: ConfigArgs) => void;

declare type ConfigArgs = {
    logLevel: LogLevel;
    log: LogFunction;
};

export declare class Disposable {
    private $_disposers;
    protected beforeDispose(disposer: Disposer): void;
    dispose(): void;
}

declare type Disposer = () => void;

export declare type InjectClass = {
    $_parentInjector?: Injector | null;
    $_getParentInjector?: ((service: InjectClass) => Injector | null) | null;
};

export declare type InjectClassConstructor = {
    new (...args: any[]): InjectClass;
};

export declare type InjectDisposer<S extends InjectService = InjectService> = (service: S) => void;

export declare class Injector {
    private parent;
    private records;
    constructor(providers?: InjectProvider[], parent?: Injector | null);
    isRegistered(provide: InjectProvide): boolean;
    get<S extends InjectService = InjectService>(provide: InjectProvide): S;
    private $_initClass;
    dispose(): void;
    static getParentInjector(service: InjectClass): Injector | null;
}

export declare type InjectProvide = any;

export declare type InjectProvider = InjectClassConstructor | {
    provide: InjectProvide;
    useClass?: InjectClassConstructor | null;
    useValue?: InjectService | null;
    dispose?: InjectDisposer | null;
};

export declare type InjectService = any;

declare type LogFunction = (msg: any, type: LogType) => void;

declare type LogLevel = 'info' | 'warn' | 'error' | 'never';

declare type LogType = 'info' | 'warn' | 'error';

export declare class Service<S extends ServiceState = ServiceState, AK extends string = string> extends Disposable implements InjectClass {
    private $_injector;
    $_parentInjector?: InjectClass['$_parentInjector'];
    $_getParentInjector?: InjectClass['$_getParentInjector'];
    displayName: string;
    $$: ServiceSources<S>;
    $: ServiceActions<AK>;
    get state(): S;
    constructor(args?: ServiceOptions<S, AK>);
    useService<S extends InjectService = InjectService>(provide: InjectProvide): S;
    useSubscribe<T = any>(ob: Observable<T>, ...args: any[]): void;
}

declare type ServiceActions<AK extends string> = Record<AK, Observable<any>>;

declare type ServiceOptions<S, AK extends string> = {
    state?: S;
    actions?: AK[];
    providers?: InjectProvider[];
};

declare type ServiceSources<S> = Record<keyof S, BehaviorSubject<any>>;

declare type ServiceState = Record<string, any>;

export { }
