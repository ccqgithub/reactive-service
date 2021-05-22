import {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo
} from 'react';
import { BehaviorSubject, Observable, PartialObserver } from 'rxjs';
import { GetService } from '@reactive-service/core';
import { InjectorContext } from './context';

export const useGetService = (): GetService => {
  const provider = useContext(InjectorContext);
  const getService: GetService = useCallback(
    (provide: any, opts: any) => {
      return provider.get(provide, opts);
    },
    [provider]
  );
  return getService;
};

export const useService: GetService = (provide: any, opts: any) => {
  const getService = useGetService();
  const service = getService(provide, opts);

  return service;
};

export const useObservable = <T = any>(
  ob$: Observable<T>,
  defaultValue: T
): T => {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    const subscription = ob$.subscribe({
      next: (v) => setState(v)
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ob$]);

  return state;
};

export const useBehavior = <T = any>(ob$: BehaviorSubject<T>): T => {
  if (!(ob$ instanceof BehaviorSubject)) {
    throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
  }

  const [state, setState] = useState(ob$.value);

  useEffect(() => {
    const subscription = ob$.subscribe({
      next: (v) => setState(v)
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ob$]);

  return state;
};

export const useObservableError = <E = any>(
  ob$: Observable<any>,
  defaultValue: E | null = null,
  opts: { onlyAfter: boolean } = { onlyAfter: true }
) => {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    let isAfter = false;
    const subscription = ob$.subscribe({
      error: (err) => {
        if (opts.onlyAfter && !isAfter) return;
        setState(err);
      }
    });
    isAfter = true;

    return () => {
      subscription.unsubscribe();
    };
  }, [ob$, opts.onlyAfter]);

  return state;
};

export function useSubscribe<T = any>(
  ob$: Observable<T>,
  observer?: PartialObserver<T>
): void;
/** @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in v1 because rxjs v8 do it. Details: https://rxjs.dev/deprecations/subscribe-arguments */
export function useSubscribe<T = any>(
  ob$: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void
): void;
export function useSubscribe<T = any>(
  ob$: Observable<T>,
  next?: ((value: T) => void) | PartialObserver<T>,
  error?: (error: any) => void,
  complete?: () => void
): void {
  const args = useMemo(() => {
    if (typeof next === 'object' && next !== null) {
      return next;
    }
    return {
      next,
      error,
      complete
    };
  }, [next, error, complete]);
  const argsRef = useRef(args);
  argsRef.current = args;

  useEffect(() => {
    const subscription = ob$.subscribe(
      (v) => argsRef.current.next && argsRef.current.next(v),
      (err) => argsRef.current.error && argsRef.current.error(err),
      () => argsRef.current.complete && argsRef.current.complete()
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [ob$, argsRef]);
}
