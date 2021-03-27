import React from 'react';
import { InjectProvider, InjectProvide, InjectService } from '@reactive-service/core';
export declare type GetService<S extends InjectService = InjectService> = (provide: InjectProvide) => S;
export declare type ServiceProviderProps = {
    providers?: InjectProvider[];
    children: React.ReactNode;
};
export declare type ServiceConsumerProps = {
    providers?: InjectProvider[];
    provides?: InjectProvide[];
    children: ((arg: {
        getService: GetService;
        services: InjectService[];
    }) => React.ReactNode) | React.ReactNode;
};
