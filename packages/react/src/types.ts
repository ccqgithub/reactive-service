import React from 'react';
import {
  InjectionProvider,
  InjectionProvide,
  InjectionValue
} from '@reactive-service/core';

export type GetService<P extends InjectionProvide = InjectionProvide> = (
  provide: P,
  opts?: { optional?: boolean }
) => InjectionValue<P>;

export type ServiceInjectorProps = {
  providers?: InjectionProvider[];
  children: React.ReactNode;
};

export type ServiceConsumerProps = {
  children:
    | ((arg: { getService: GetService }) => React.ReactNode)
    | React.ReactNode;
};

export type RRefObject<T = any> = {
  value: T;
};
