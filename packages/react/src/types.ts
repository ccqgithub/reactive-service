import React from 'react';
import { InjectionProvider, GetService } from './core';

export type ServiceInjectorProps = {
  providers?: InjectionProvider[];
  children: React.ReactNode;
};

export type ServiceConsumerProps = {
  children:
    | ((arg: { getService: GetService }) => React.ReactNode)
    | React.ReactNode;
};
