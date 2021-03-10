import { autorun } from 'mobx';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Observable, Subscription } from 'rxjs';
import { Context } from './context';
import Service from './service';

export type GetService = (name: string) => Service<any>;

export function useGetService(): GetService {
  const provider = useContext(Context);
  const getService = useCallback(
    (name) => {
      return provider.get(name);
    },
    [provider]
  );
  return getService;
}

export function useService(name: string): Service<any> {
  const getService = useGetService();
  return getService(name);
}

export function useServices(names: string[]): Record<string, Service<any>> {
  const getService = useGetService();
  const services: { [key: string]: ReturnType<typeof getService> } = {};
  names.forEach((name) => {
    services[name] = getService(name);
  });

  return services;
}

type SubscribeFunc = (ob$: Observable<any>, ...args: any[]) => void;
export function useSubscribe(): SubscribeFunc {
  const subscriptions = useRef<Subscription[]>([]);
  const subscribe = useCallback(
    (ob$, ...args) => {
      const subscription = ob$.subscribe(...args);
      subscriptions.current.push(subscription);
    },
    [subscriptions]
  );

  useEffect(() => {
    const subs = subscriptions.current;
    return () => {
      subs.forEach((subscription) => {
        subscription.unsubscribe();
      });
      subscriptions.current = [];
    };
  }, [subscriptions]);

  return subscribe;
}

type ComputeFunc = (arg: {
  getService: ReturnType<typeof useGetService>;
}) => any;
export function useCompute(computeFunc: ComputeFunc): any {
  const getService = useGetService();
  // computed state
  const [state, setState] = useState(() => {
    const initialState = computeFunc({ getService });
    return initialState;
  });
  // 忽略第一次autorun，因为第一次留给了useState
  const firstRun = useRef(true);
  useEffect(() => {
    const disposer = autorun(() => {
      const val = computeFunc({ getService });
      if (!firstRun.current) setState(val);
    });
    firstRun.current = false;

    return () => {
      disposer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getService, computeFunc]);

  return state;
}
