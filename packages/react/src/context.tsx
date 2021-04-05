import React, { createContext, useContext } from 'react';
import { Injector, debug } from '@reactive-service/core';
import {
  ServiceInjectorProps,
  ServiceConsumerProps,
  GetService
} from './types';

const InjectorContext = createContext<Injector>(new Injector());

const ServiceInjector = (props: ServiceInjectorProps): React.ReactElement => {
  const parentInjector = useContext(InjectorContext);
  const { providers = [], children } = props;
  const injector = new Injector(providers, parentInjector);
  return (
    <InjectorContext.Provider value={injector}>
      {children}
    </InjectorContext.Provider>
  );
};

const ServiceConsumer = (props: ServiceConsumerProps): React.ReactNode => {
  const injector = useContext(InjectorContext);
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

export { InjectorContext, ServiceInjector, ServiceConsumer };
