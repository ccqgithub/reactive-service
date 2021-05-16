import { BehaviorSubject } from 'rxjs';
import { GetService } from '@reactive-service/core';
import hoistStatics from 'hoist-non-react-statics';
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

export declare const useObservableError: <T = any>(ob$: Observable<T>, defaultValue?: any, opts?: {
    onlyAfter: boolean;
}) => any;

export declare const useService: GetService;

export declare function useSubscribe<T = any>(ob$: Observable<T>, observer?: PartialObserver<T>): void;

export declare function useSubscribe<T = any>(ob$: Observable<T>, next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): void;

export declare const withInjector: (args: {
    providers: InjectionProvider[];
}) => <P>(Component: React_2.ComponentType<P>) => React_2.ForwardRefExoticComponent<React_2.PropsWithoutRef<P> & React_2.RefAttributes<React_2.ComponentType<P>>> & hoistStatics.NonReactStatics<React_2.ComponentType<P>, {}>;

export * from "@reactive-service/core";

export { }
