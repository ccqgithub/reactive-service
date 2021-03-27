import React, { createContext, useContext } from 'react';
import { Injector } from '@reactive-service/core';
import {
  ServiceProviderProps,
  ServiceConsumerProps,
  GetService
} from './types';

const ServiceContext = createContext<Injector>(new Injector());

const ServiceProvider = (props: ServiceProviderProps): React.ReactElement => {
  const parentInjector = useContext(ServiceContext);
  const { providers = [], children } = props;
  const injector = new Injector(providers, parentInjector);
  return (
    <ServiceContext.Provider value={injector}>
      {children}
    </ServiceContext.Provider>
  );
};

const ServiceConsumer = (props: ServiceConsumerProps): React.ReactNode => {
  const parentInjector = useContext(ServiceContext);
  const getService: GetService = (provide) => parentInjector.get(provide);
  const { provides = [] } = props;
  const services = provides.map((provide) => getService(provide));
  return typeof props.children === 'function'
    ? props.children({ services, getService })
    : props.children;
};

export { ServiceContext, ServiceProvider, ServiceConsumer };
