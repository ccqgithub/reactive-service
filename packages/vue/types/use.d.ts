import { Ref } from 'vue';
import { BehaviorSubject, Observable, PartialObserver, Subscription } from 'rxjs';
import { GetService, InjectionProvider } from './core';
export declare const useInjector: (args: {
    providers: InjectionProvider[];
}) => void;
export declare const useGetService: () => GetService;
export declare const useService: GetService;
export declare function useRx(): {
    subscribe: <T = any>(ob$: Observable<T>, observer: PartialObserver<T>) => Subscription['unsubscribe'];
    refObservable: <T_1 = any>(ob$: Observable<T_1>, defaultValue: T_1) => Ref<T_1>;
    refBehavior: <T_2 = any>(ob$: BehaviorSubject<T_2>) => Ref<T_2>;
    refObservableError: <T_3 = any>(ob$: Observable<T_3>, defaultValue: T_3, opts?: {
        onlyAfter: boolean;
    }) => Ref<T_3>;
};
//# sourceMappingURL=use.d.ts.map