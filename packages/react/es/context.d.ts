import React from 'react';
import { Injector } from '@reactive-service/core';
import { ProviderProps, ConsumerProps } from './types';
declare const Context: React.Context<Injector>;
declare const Provider: (props: ProviderProps) => React.ReactElement;
declare const Consumer: (props: ConsumerProps) => React.ReactNode;
export { Context, Provider, Consumer };
