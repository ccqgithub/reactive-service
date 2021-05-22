import { BehaviorSubject } from 'rxjs';
import { GetService } from '@reactive-service/core';
import { InjectionProvider } from '@reactive-service/core';
import { Observable } from 'rxjs';
import { PartialObserver } from 'rxjs';
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

export declare const useObservableError: <E = any>(ob$: Observable<any>, defaultValue?: E | null, opts?: {
    onlyAfter: boolean;
}) => E | null;

export declare const useService: GetService;

export declare function useSubscribe<T = any>(ob$: Observable<T>, observer?: PartialObserver<T>): void;

/** @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in v1 because rxjs v8 do it. Details: https://rxjs.dev/deprecations/subscribe-arguments */
export declare function useSubscribe<T = any>(ob$: Observable<T>, next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): void;

export * from "@reactive-service/core";

export { }
