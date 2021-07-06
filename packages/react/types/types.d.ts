import React from 'react';
import { InjectionProvider, GetService } from './core';
export declare type ServiceInjectorProps = {
    providers?: InjectionProvider[];
    children: React.ReactNode;
};
export declare type ServiceConsumerProps = {
    children: ((arg: {
        getService: GetService;
    }) => React.ReactNode) | React.ReactNode;
};
//# sourceMappingURL=types.d.ts.map