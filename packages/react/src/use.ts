import { useCallback, useContext, useEffect, useState } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { InjectorProvide, InjectorService } from '@reactive-service/core';
import { Context } from './context';
import { GetService } from './types';

export function useGetService(): GetService {
  const provider = useContext(Context);
  const getService = useCallback(
    (provide) => {
      return provider.get(provide);
    },
    [provider]
  );
  return getService;
}

export function useService(provide: InjectorProvide): InjectorService {
  const getService = useGetService();
  return getService(provide);
}

export function useServices(provides: InjectorProvide[]): InjectorService[] {
  const getService = useGetService();
  return provides.map((provide) => getService(provide));
}

export function useObservable<T = any>(
  ob$: Observable<T>,
  defaultValue: unknown = undefined
): any {
  const [state, setState] = useState(() => {
    if (ob$ instanceof BehaviorSubject) return ob$.value;
    return defaultValue;
  });

  useEffect(() => {
    const subscription = ob$.subscribe({
      next: (v) => setState(v),
      error: (err) => {
        throw err;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [ob$]);

  return state;
}
