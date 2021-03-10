import React, { createContext, useContext } from 'react';
import ServiceProvider, { ProviderConfigs } from './provider';

const Context = createContext<ServiceProvider>(new ServiceProvider());

export type ProviderProps = React.ComponentProps<any> & {
  services: ProviderConfigs;
};

const Provider = (props: ProviderProps): React.ReactNode => {
  const parentProvider = useContext(Context);
  const { services } = props;
  const provider = new ServiceProvider(services, parentProvider);
  return <Context.Provider value={provider}>{props.children}</Context.Provider>;
};

const Consumer = (props: React.ComponentProps<any>): React.ReactNode => {
  const parentProvider = useContext(Context);
  const getService = (key: string) => parentProvider.get(key);
  return props.children({ getService });
};

export { Context, Provider, Consumer };
