import Service from './service';
export declare type ProviderServices = {
    [key: string]: Service<any>;
};
export declare type ProviderConfig = {
    useClass?: typeof Service;
    useInstance?(provider: Provider): Service<any>;
};
export declare type ProviderConfigs = {
    [key: string]: typeof Service | ProviderConfig;
};
export default class Provider {
    private parent;
    private services;
    private configs;
    constructor(configs?: ProviderConfigs, parent?: Provider | null);
    isRegistered(name: string): boolean;
    get(name: string): Service<any>;
    dispose(): void;
    private init;
}
