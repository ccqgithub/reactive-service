import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { InjectionProvide, InjectionValue } from '@reactive-service/core';
import { InjectorContext } from './context';
import { GetService } from './types';

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

export const useService = <P extends InjectionProvide>(
  provide: P
): InjectionValue<P> => {
  const getService = useGetService();
  return getService(provide);
};

export function useServices(provides: InjectionProvide[]): any[] {
  const getService = useGetService();
  return provides.map((provide) => getService(provide));
}

export function useObservable<T = any>(
  ob$: Observable<T>,
  defaultValue?: T
): T {
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
