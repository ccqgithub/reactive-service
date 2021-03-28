import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { InjectProvide, InjectService } from '@reactive-service/core';
import { ServiceContext } from './context';
import { GetService } from './types';

export function useGetService(): GetService {
  const provider = useContext(ServiceContext);
  const getService: GetService = useCallback(
    (provide) => {
      return provider.get(provide);
    },
    [provider]
  );
  return getService;
}

export function useService<S extends InjectService = InjectService>(
  provide: InjectProvide
): S {
  const getService = useGetService() as GetService<S>;
  return getService(provide);
}

export function useServices(provides: InjectProvide[]): InjectService[] {
  const getService = useGetService();
  return provides.map((provide) => getService(provide));
}

export function useObservable<T = any>(
  ob$: Observable<T>,
  defaultValue?: T
): any {
  const [state, setState] = useState(() => {
    if (ob$ instanceof BehaviorSubject) return ob$.value;
    return defaultValue;
  });

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
  const [error, setError] = useState(null);
  const ignore = useMemo(() => {
    return ob$ instanceof Subject && onlyAfter && ob$.hasError;
  }, [ob$, onlyAfter]);

  useEffect(() => {
    if (ignore) return;
    const subscription = ob$.subscribe({
      error: (err) => {
        setError(err);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ob$, ignore]);

  return error;
}
