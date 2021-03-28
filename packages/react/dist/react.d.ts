import { Injector } from '@reactive-service/core';
import { InjectProvide } from '@reactive-service/core';
import { InjectProvider } from '@reactive-service/core';
import { InjectService } from '@reactive-service/core';
import { Observable } from 'rxjs';
import { default as React_2 } from 'react';

export declare type GetService<S extends InjectService = InjectService> = (provide: InjectProvide) => S;

export declare const ServiceConsumer: (props: ServiceConsumerProps) => React_2.ReactNode;

export declare type ServiceConsumerProps = {
    providers?: InjectProvider[];
    provides?: InjectProvide[];
    children: ((arg: {
        getService: GetService;
        services: InjectService[];
    }) => React_2.ReactNode) | React_2.ReactNode;
};

export declare const ServiceContext: React_2.Context<Injector>;

export declare const ServiceProvider: (props: ServiceProviderProps) => React_2.ReactElement;

export declare type ServiceProviderProps = {
    providers?: InjectProvider[];
    children: React_2.ReactNode;
};

export declare function useGetService(): GetService;

export declare function useObservable<T = any>(ob$: Observable<T>, defaultValue?: T): any;

export declare function useObservableError<T = any>(ob$: Observable<T>, onlyAfter?: boolean): any;

export declare function useService<S extends InjectService = InjectService>(provide: InjectProvide): S;

export declare function useServices(provides: InjectProvide[]): InjectService[];

export * from "@reactive-service/core";

export { }
