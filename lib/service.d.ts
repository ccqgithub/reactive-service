import { Subject, BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import Provider, { ProviderConfigs } from './provider';
import { AnyFunction } from './types';
export declare type ServiceSource = Subject<any> | BehaviorSubject<any> | ReplaySubject<any>;
export declare type ServiceSources = {
    [key: string]: ServiceSource;
};
export declare type ServiceActions = {
    [key: string]: Subject<any>;
};
export declare type ServiceState = Record<string, unknown>;
export declare type SourceConfig = {
    type: 'normal' | 'behavior' | 'replay';
    default?($data: ServiceState): any;
    params?: {
        bufferSize?: number;
        windowTime?: number;
    };
};
export declare type SourceConfigs = {
    [key: string]: 'normal' | 'behavior' | 'replay' | SourceConfig;
};
export declare type ServiceConfigs<S extends ServiceState> = {
    providers?: ProviderConfigs;
    state?: S;
    sources?: SourceConfigs;
    actions?: string[];
};
export default class Service<S extends ServiceState = ServiceState> {
    private $_clearCallbacks;
    private $_serviceProvider;
    readonly state: S;
    sources: ServiceSources;
    actions: ServiceActions;
    constructor(parentProvider?: Provider | null);
    protected setup(): ServiceConfigs<S>;
    getState(): S;
    mutation(fn: (state: S) => void): void;
    subscribe(ob$: Observable<any>, ...args: any[]): void;
    useService(name: string): Service<S>;
    beforeClear(fn: AnyFunction): void;
    dispose(): void;
}
