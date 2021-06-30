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

export function useRx() {
  const subs: Subscription[] = [];

  onBeforeUnmount(() => {
    subs.forEach((sub) => {
      sub.unsubscribe();
    });
  });

  const subscribe = <T = any>(
    ob$: Observable<T>,
    observer: PartialObserver<T>
  ): Subscription['unsubscribe'] => {
    const sub = ob$.subscribe(observer);
    subs.push(sub);

    const unsubscribe = () => {
      sub.unsubscribe();
      const i = subs.indexOf(sub);
      if (i !== -1) subs.splice(i, 1);
    };

    return unsubscribe;
  };

  const refBehavior = <T = any>(ob$: BehaviorSubject<T>) => {
    const res = ref(ob$.value) as Ref<T>;
    subscribe(ob$, {
      next: (v) => {
        res.value = v;
      }
    });
    return res;
  };

  const refObservable = <T = any>(ob$: Observable<T>, defaultValue: T) => {
    const res = ref(defaultValue) as Ref<T>;
    subscribe(ob$, {
      next: (v) => {
        res.value = v;
      }
    });
    return res;
  };

  const refObservableError = <T = any>(
    ob$: Observable<T>,
    defaultValue: T,
    opts: { onlyAfter: boolean } = { onlyAfter: true }
  ) => {
    const res = ref(defaultValue) as Ref<T>;

    let isAfter = false;
    subscribe(ob$, {
      error: (err) => {
        if (opts.onlyAfter && !isAfter) return;
        res.value = err;
      }
    });
    isAfter = true;

    return res;
  };

  return {
    subscribe,
    refObservable,
    refBehavior,
    refObservableError
  };
}
