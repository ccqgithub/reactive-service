import React from 'react';
import {
  InjectProvider,
  InjectProvide,
  InjectService
} from '@reactive-service/core';

export type GetService<S extends InjectService = InjectService> = (
  provide: InjectProvide
) => S;

export type ServiceProviderProps = {
  providers?: InjectProvider[];
  children: React.ReactNode;
};

export type ServiceConsumerProps = {
  providers?: InjectProvider[];
  provides?: InjectProvide[];
  children:
    | ((arg: {
        getService: GetService;
        services: InjectService[];
      }) => React.ReactNode)
    | React.ReactNode;
};
