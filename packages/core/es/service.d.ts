import { BehaviorSubject, Observable } from 'rxjs';
import Disposable from './disposable';
import { InjectProvider, InjectProvide, InjectService, InjectClass } from './types';
export declare type ServiceState = Record<string, any>;
export declare type ServiceSources<S> = Record<keyof S, BehaviorSubject<any>>;
export declare type ServiceActions<AK extends string> = Record<AK, Observable<any>>;
export declare type ServiceOptions<S, AK extends string> = {
    state?: S;
    actions?: AK[];
    providers?: InjectProvider[];
};
export default class Service<S extends ServiceState = ServiceState, AK extends string = string> extends Disposable implements InjectClass {
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
