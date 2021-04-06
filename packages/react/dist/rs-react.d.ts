import { forwardRef } from 'react';
import { InjectionProvide } from '@reactive-service/core';
import { InjectionProvider } from '@reactive-service/core';
import { InjectionValue } from '@reactive-service/core';
import { Observable } from 'rxjs';
import { default as React_2 } from 'react';

export declare type GetService<P extends InjectionProvide = InjectionProvide> = (provide: P, opts?: {
    optional?: boolean;
}) => InjectionValue<P>;

export declare const ServiceConsumer: (props: ServiceConsumerProps) => React_2.ReactNode;

export declare type ServiceConsumerProps = {
    children: ((arg: {
        getService: GetService;
    }) => React_2.ReactNode) | React_2.ReactNode;
};

export declare const ServiceInjector: (props: ServiceInjectorProps) => React_2.ReactElement;

export declare type ServiceInjectorProps = {
    providers?: InjectionProvider[];
    children: React_2.ReactNode;
};

export declare function useGetService(): GetService;

export declare function useObservable<T = any>(ob$: Observable<T>, defaultValue?: T): T;

export declare function useObservableError<T = any>(ob$: Observable<T>, onlyAfter?: boolean): any;

export declare const useService: <P extends InjectionProvide>(provide: P) => InjectionValue<P>;

export declare function useServices(provides: InjectionProvide[]): any[];

export declare const withInjector: (args: {
    providers: InjectionProvider[];
}) => <P extends Record<string, any>>(Component: React_2.ComponentType<P>) => ReturnType<typeof forwardRef>;

export * from "@reactive-service/core";

export { }
