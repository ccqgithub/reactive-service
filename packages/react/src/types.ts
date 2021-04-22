import React from 'react';
import { InjectionProvider, GetService } from '@reactive-service/core';

export type ServiceInjectorProps = {
  providers?: InjectionProvider[];
  children: React.ReactNode;
};

export type ServiceConsumerProps = {
  children:
    | ((arg: { getService: GetService }) => React.ReactNode)
    | React.ReactNode;
};

export type RSRefObject<T = any> = {
  current: T;
};
