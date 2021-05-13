import { BehaviorSubject } from 'rxjs';
import { forwardRef } from 'react';
import { GetService } from '@reactive-service/core';
import { InjectionProvider } from '@reactive-service/core';
import { Observable } from 'rxjs';
import { default as React_2 } from 'react';

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

export declare const useBehavior: <T = any>(ob$: BehaviorSubject<T>) => T;

export declare const useGetService: () => GetService;

export declare const useObservable: <T = any>(ob$: Observable<T>, defaultValue: T) => T;

export declare const useObservableError: <T = any>(ob$: Observable<T>, onlyAfter?: boolean) => any;

export declare const useService: GetService;

export declare const useSubscribe: <T = any>(ob$: Observable<T>, args: {
    next?: ((p: T) => void) | undefined;
    error?: ((err: any) => void) | undefined;
    complete?: (() => void) | undefined;
}) => void;

export declare const withInjector: (args: {
    providers: InjectionProvider[];
}) => <P extends Record<string, any>>(Component: React_2.ComponentType<P>) => ReturnType<typeof forwardRef>;

export * from "@reactive-service/core";

export { }
