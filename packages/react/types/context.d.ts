import React from 'react';
import { Injector } from '@reactive-service/core';
import { ServiceInjectorProps, ServiceConsumerProps } from './types';
declare const InjectorContext: React.Context<Injector>;
declare const ServiceInjector: (props: ServiceInjectorProps) => React.ReactElement;
declare const ServiceConsumer: (props: ServiceConsumerProps) => React.ReactNode;
export { InjectorContext, ServiceInjector, ServiceConsumer };
//# sourceMappingURL=context.d.ts.map