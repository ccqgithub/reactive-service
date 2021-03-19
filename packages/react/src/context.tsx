import React, { createContext, useContext } from 'react';
import { Injector } from '@reactive-service/core';
import { GetService, ProviderProps, ConsumerProps } from './types';

const Context = createContext<Injector>(new Injector());

const Provider = (props: ProviderProps): React.ReactElement => {
  const parentInjector = useContext(Context);
  const { providers } = props;
  const injector = new Injector(providers, parentInjector);
  return <Context.Provider value={injector}>{props.children}</Context.Provider>;
};

const Consumer = (props: ConsumerProps): React.ReactNode => {
  const parentInjector = useContext(Context);
  const getService: GetService = (provide) => parentInjector.get(provide);
  const { provides = [] } = props;
  const services = provides.map((provide) => getService(provide));
  return typeof props.children === 'function'
    ? props.children(services, getService)
    : props.children;
};

export { Context, Provider, Consumer };
