import React from 'react';
import { Injector } from '@reactive-service/core';
import { ServiceProviderProps, ServiceConsumerProps } from './types';
declare const ServiceContext: React.Context<Injector>;
declare const ServiceProvider: (props: ServiceProviderProps) => React.ReactElement;
declare const ServiceConsumer: (props: ServiceConsumerProps) => React.ReactNode;
export { ServiceContext, ServiceProvider, ServiceConsumer };
