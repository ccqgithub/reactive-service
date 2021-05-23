import { BehaviorSubject, Observable, PartialObserver } from 'rxjs';
import { GetService } from '@reactive-service/core';
export declare const useGetService: () => GetService;
export declare const useService: GetService;
export declare const useObservable: <T = any>(ob$: Observable<T>, defaultValue: T) => T;
export declare const useBehavior: <T = any>(ob$: BehaviorSubject<T>) => T;
export declare const useObservableError: <E = any>(ob$: Observable<any>, defaultValue?: E | null, opts?: {
    onlyAfter: boolean;
}) => E | null;
export declare function useSubscribe<T = any>(ob$: Observable<T>, observer?: PartialObserver<T>): void;
/** @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in v1 because rxjs v8 do it. Details: https://rxjs.dev/deprecations/subscribe-arguments */
export declare function useSubscribe<T = any>(ob$: Observable<T>, next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): void;
//# sourceMappingURL=use.d.ts.map