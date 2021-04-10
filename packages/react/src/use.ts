import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { InjectionProvide, InjectionValue } from '@reactive-service/core';
import { InjectorContext } from './context';
import { GetService, RRefObject } from './types';

export function useRSRef<T = any>(value: T): RRefObject<T> {
  const [state, setState] = useState(value);
  const resRef: RRefObject = {
    get value() {
      return state;
    },
    set value(v) {
      setState(v);
    }
  };
  return resRef;
}

export function useRSValueRef<T = any>(value: T): RRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  const resRef: RRefObject = {
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
  return getService(provide);
}

export function useServiceRef<P extends InjectionProvide>(
  provide: P
): RRefObject<InjectionValue<P>> {
  const service = useService(provide);
  const resRef = useRSValueRef(service);
  return resRef;
}

export function useObservableRef<T = any>(
  ob$: Observable<T>,
  defaultValue: T
): RRefObject<T> {
  const ref = useRSRef(defaultValue);
  const resRef: RRefObject<T> = {
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
): RRefObject<T> {
  if (!(ob$ instanceof BehaviorSubject)) {
    throw new Error(`The useBehaviorState can only use with BehaviorSubject!`);
  }

  const ref = useRSRef(ob$.value);
  const resRef: RRefObject<T> = {
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
  const resRef: RRefObject<T | null> = {
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

export function useListener<T = any>(
  value: T,
  listner: (arg: T) => void
): void {
  const ref = useRef(listner);
  ref.current = listner;

  useEffect(() => {
    ref.current(value);
  }, [value]);
}
