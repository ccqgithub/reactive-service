import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
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

export const useObservableError = <T = any>(
  ob$: Observable<T>,
  onlyAfter = false
): any => {
  const [state, setState] = useState(null);

  useEffect(() => {
    const ignore = ob$ instanceof Subject && onlyAfter && ob$.hasError;
    if (ignore) return;
    const subscription = ob$.subscribe({
      error: (err) => {
        setState(err);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ob$, onlyAfter]);

  return state;
};

export const useSubscribe = <T = any>(
  ob$: Observable<T>,
  args: {
    next?: (p: T) => void;
    error?: (err: any) => void;
    complete?: () => void;
  }
) => {
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
};
