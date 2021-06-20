import {
  provide,
  inject,
  getCurrentInstance,
  ref,
  onBeforeUnmount,
  Ref
} from 'vue';
import {
  BehaviorSubject,
  Observable,
  PartialObserver,
  Subscription
} from 'rxjs';

import { GetService, Injector, InjectionProvider } from './core';
import {
  injectorKey,
  instanceInjectorKey,
  InstanceWithInjector
} from './context';

export const useInjector = (args: { providers: InjectionProvider[] }) => {
  const instance = getCurrentInstance() as InstanceWithInjector;
  const parentInjector = inject(injectorKey, null);
  const injector = new Injector(args.providers, parentInjector);
  instance[instanceInjectorKey] = injector;
  provide(injectorKey, injector);
};

export const useGetService = (): GetService => {
  const instance = getCurrentInstance() as InstanceWithInjector;
  const injector = instance[instanceInjectorKey] || inject(injectorKey, null);
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
  const injector = instance[instanceInjectorKey] || inject(injectorKey, null);
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

export const useObservableError = <T = any>(
  ob$: Observable<T>,
  defaultValue: any = null,
  opts: { onlyAfter: boolean } = { onlyAfter: true }
): any => {
  const state = ref(defaultValue) as Ref<T>;

  let isAfter = false;
  const subscription = ob$.subscribe({
    error: (err) => {
      if (opts.onlyAfter && !isAfter) return;
      state.value = err;
    }
  });
  isAfter = true;

  onBeforeUnmount(() => {
    subscription.unsubscribe();
  });

  return state;
};

export function useSubscribe() {
  const subs = ref<Subscription[]>([]);

  const subscribe = <T = any>(
    ob$: Observable<T>,
    observer: PartialObserver<T>
  ): void => {
    const sub = ob$.subscribe(observer);
    subs.value.push(sub);
  };

  onBeforeUnmount(() => {
    subs.value.forEach((sub) => {
      sub.unsubscribe();
    });
  });

  return subscribe;
}
