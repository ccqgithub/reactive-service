import React, { createContext, useContext } from 'react';
import { Injector, debug } from '@reactive-service/core';
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
  const injector = useContext(ServiceContext);
  const getService: GetService = (provide, opts = {}) => {
    const { optional = false } = opts;
    const service = injector.get(provide);
    if (!service && !optional) {
      debug(provide, 'error');
      throw new Error(`Can not find the service, you provide it?`);
    }
  };

  return typeof props.children === 'function'
    ? props.children({ getService })
    : props.children;
};

export { ServiceContext, ServiceProvider, ServiceConsumer };
