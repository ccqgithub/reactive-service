import React from 'react';
import { InjectorProvide, InjectorService, InjectorProvider } from '@reactive-service/core';
export declare type GetService = (provide: InjectorProvide) => InjectorService;
export declare type ProviderProps = {
    providers: InjectorProvider[];
    children: React.ReactNode;
};
export declare type ConsumerProps = {
    provides: InjectorProvide[];
    children?: (services: InjectorService[], getService: GetService) => React.ReactNode;
};
