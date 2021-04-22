import React, { createContext, useContext } from 'react';
import { Injector, GetService } from '@reactive-service/core';
import { ServiceInjectorProps, ServiceConsumerProps } from './types';

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
  const getService: GetService = (provide: any, opts: any) => {
    return injector.get(provide, opts);
  };

  return typeof props.children === 'function'
    ? props.children({ getService })
    : props.children;
};

export { InjectorContext, ServiceInjector, ServiceConsumer };
