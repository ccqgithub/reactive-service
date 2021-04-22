import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { GetService } from '@reactive-service/core';
import { InjectorContext } from './context';
import { RSRefObject } from './types';

export function useRSRef<T = any>(value: T): RSRefObject<T> {
  const [state, setState] = useState(value);
  const resRef: RSRefObject = {
    get current() {
      return state;
    },
    set current(v) {
      setState(v);
    }
  };
  return resRef;
}

export function useValueRef<T = any>(value: T): RSRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  const resRef: RSRefObject = {
    get current() {
      return ref.current;
    },
    set current(v) {
      throw new Error(`Can not set value to this ref of useRSWatchRef!`);
    }
  };
  return resRef;
}

export function useGetService(): GetService {
  const provider = useContext(InjectorContext);
  const getService: GetService = useCallback(
    (provide: any, opts: any) => {
      return provider.get(provide, opts);
    },
    [provider]
  );
  return getService;
}

export const useService: GetService = (provide: any, opts: any) => {
  const getService = useGetService();
  const service = getService(provide, opts);

  return service;
};

export function useObservable<T = any>(ob$: Observable<T>, defaultValue: T): T {
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
}

export function useBehavior<T = any>(ob$: BehaviorSubject<T>): T {
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
}

export function useObservableError<T = any>(
  ob$: Observable<T>,
  onlyAfter = false
): any {
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
}

export function useListenValue<T = any>(
  value: T,
  listner: (arg: T) => void
): void {
  const ref = useRef(listner);
  ref.current = listner;

  useEffect(() => {
    ref.current(value);
  }, [value]);
}
