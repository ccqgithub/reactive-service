import React from 'react';
import ServiceProvider, { ProviderConfigs } from './provider';
declare const Context: React.Context<ServiceProvider>;
export declare type ProviderProps = React.ComponentProps<any> & {
    services: ProviderConfigs;
};
declare const Provider: (props: ProviderProps) => React.ReactNode;
declare const Consumer: (props: React.ComponentProps<any>) => React.ReactNode;
export { Context, Provider, Consumer };
