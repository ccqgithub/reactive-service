import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { InjectionProvide, InjectionValue } from '@reactive-service/core';
import { InjectorContext } from './context';
import { GetService, RSRefObject } from './types';

export function useRSRef<T = any>(value: T): RSRefObject<T> {
  const [state, setState] = useState(value);
  const resRef: RSRefObject = {
    get value() {
      return state;
    },
    set value(v) {
      setState(v);
    }
  };
  return resRef;
}

export function useValueRef<T = any>(value: T): RSRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  const resRef: RSRefObject = {
    get value() {
      return ref.current;
    },
    set value(v) {
      throw new Error(`Can not set value to this ref of useRSWatchRef!`);
    }
  };
  return resRef;
}

export function useGetService(): GetService {
  const provider = useContext(InjectorContext);
  const getService = useCallback(
    <P extends InjectionProvide>(provide: P): InjectionValue<P> | null => {
      return provider.get(provide);
    },
    [provider]
  );
  return getService;
}

export function useService<P extends InjectionProvide>(
  provide: P
): InjectionValue<P> {
  const getService = useGetService();
  const service = getService(provide);

  return service;
}

export function useObservableRef<T = any>(
  ob$: Observable<T>,
  defaultValue: T
): RSRefObject<T> {
  const ref = useRSRef(defaultValue);
  const resRef: RSRefObject<T> = {
    get value() {
      return ref.value;
    },
    set value(v) {
      throw new Error(`Can not set value to this ref of useObservableRef!`);
    }
  };

  useEffect(() => {
    const subscription = ob$.subscribe({
      next: (v) => (ref.value = v)
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ob$, ref]);

  return resRef;
}

export function useBehaviorRef<T = any>(
  ob$: BehaviorSubject<T>
): RSRefObject<T> {
  if (!(ob$ instanceof BehaviorSubject)) {
    throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
  }

  const ref = useRSRef(ob$.value);
  const resRef: RSRefObject<T> = {
    get value() {
      return ref.value;
    },
    set value(v) {
      throw new Error(`Can not set value to this ref of useBehaviorRef!`);
    }
  };

  useEffect(() => {
    const subscription = ob$.subscribe({
      next: (v) => (ref.value = v)
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ob$, ref]);

  return resRef;
}

export function useObservableError<T = any>(
  ob$: Observable<T>,
  onlyAfter = false
): any {
  const ref = useRSRef(null);
  const resRef: RSRefObject<T | null> = {
    get value() {
      return ref.value;
    },
    set value(v) {
      throw new Error(`Can not set value to this ref of useBehaviorRef!`);
    }
  };

  useEffect(() => {
    const ignore = ob$ instanceof Subject && onlyAfter && ob$.hasError;
    if (ignore) return;
    const subscription = ob$.subscribe({
      error: (err) => {
        ref.value = err;
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ob$, onlyAfter, ref]);

  return resRef;
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
