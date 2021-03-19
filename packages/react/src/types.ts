import React from 'react';
import {
  InjectorProvide,
  InjectorService,
  InjectorProvider
} from '@reactive-service/core';

export type GetService = (provide: InjectorProvide) => InjectorService;

export type ProviderProps = {
  providers: InjectorProvider[];
  children: React.ReactNode;
};

export type ConsumerProps = {
  provides: InjectorProvide[];
  children?: (
    services: InjectorService[],
    getService: GetService
  ) => React.ReactNode;
};