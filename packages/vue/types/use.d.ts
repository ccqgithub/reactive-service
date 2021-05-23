import { Ref } from 'vue';
import { GetService, InjectionProvider } from '@reactive-service/core';
import { BehaviorSubject, Observable, PartialObserver } from 'rxjs';
export declare const useInjector: (args: {
    providers: InjectionProvider[];
}) => void;
export declare const useGetService: () => GetService;
export declare const useService: GetService;
export declare const useObservable: <T = any>(ob$: Observable<T>, defaultValue: T) => Ref<T>;
export declare const useBehavior: <T = any>(ob$: BehaviorSubject<T>) => Ref<T>;
export declare const useObservableError: <T = any>(ob$: Observable<T>, defaultValue?: any, opts?: {
    onlyAfter: boolean;
}) => any;
export declare function useSubscribe<T = any>(ob$: Observable<T>, observer: PartialObserver<T>): void;
//# sourceMappingURL=use.d.ts.map