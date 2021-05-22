import {
  provide,
  inject,
  getCurrentInstance,
  ref,
  onBeforeUnmount,
  Ref
} from 'vue';
import {
  GetService,
  Injector,
  InjectionProvider
} from '@reactive-service/core';
import { BehaviorSubject, Observable, PartialObserver } from 'rxjs';

import {
  injectorKey,
  instanceInjectorKey,
  InstanceWithInjector
} from './context';

export const useInjector = (args: { providers: InjectionProvider[] }) => {
  const instance = getCurrentInstance() as InstanceWithInjector;
  const parentInjector = inject(injectorKey);
  const injector = new Injector(args.providers, parentInjector);
  instance[instanceInjectorKey] = injector;
  provide(injectorKey, injector);
};

export const useGetService = (): GetService => {
  const instance = getCurrentInstance() as InstanceWithInjector;
  const injector = instance[instanceInjectorKey] || inject(injectorKey);
  const getService: GetService = (provide: any, opts: any) => {
    if (!injector) {
      if (!opts || !opts.optional) {
        throw new Error(`Never register any injector!`);
      }
      return null;
    }
    return injector.get(provide, opts);
  };
  return getService;
};

export const useService: GetService = (provide: any, opts: any) => {
  const instance = getCurrentInstance() as InstanceWithInjector;
  const injector = instance[instanceInjectorKey] || inject(injectorKey);
  if (!injector) {
    if (!opts || !opts.optional) {
      throw new Error(`Never register any injectorå!`);
    }
    return null;
  }
  return injector.get(provide, opts);
};

export const useObservable = <T = any>(ob$: Observable<T>, defaultValue: T) => {
  const state = ref(defaultValue) as Ref<T>;
  const subscription = ob$.subscribe({
    next: (v) => (state.value = v)
  });
  onBeforeUnmount(() => {
    subscription.unsubscribe();
  });

  return state;
};

export const useBehavior = <T = any>(ob$: BehaviorSubject<T>) => {
  if (!(ob$ instanceof BehaviorSubject)) {
    throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
  }

  const state = ref(ob$.value) as Ref<T>;
  const subscription = ob$.subscribe({
    next: (v) => (state.value = v)
  });
  onBeforeUnmount(() => {
    subscription.unsubscribe();
  });

  return state;
};

export const useObservableCurrentError = <E = any>(ob$: Observable<any>) => {
  let error: E | null = null;
  const subscription = ob$.subscribe({
    error: (err) => (error = err)
  });
  subscription.unsubscribe();
  return error;
};

export const useObservableError = <T = any>(
  ob$: Observable<T>,
  defaultValue: any = null,
  opts: { onlyAfter: boolean } = { onlyAfter: true }
): any => {
  const state = ref(defaultValue) as Ref<T>;

  if (opts.onlyAfter) {
    const curError = useObservableCurrentError(ob$);
    // has error before
    if (curError !== null) return;
  }

  const subscription = ob$.subscribe({
    error: (err) => {
      state.value = err;
    }
  });

  onBeforeUnmount(() => {
    subscription.unsubscribe();
  });

  return state;
};

export function useSubscribe<T = any>(
  ob$: Observable<T>,
  observer: PartialObserver<T>
): void {
  const subscription = ob$.subscribe(observer);
  onBeforeUnmount(() => {
    subscription.unsubscribe();
  });
}
