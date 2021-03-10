import Service from './service';

export type ProviderServices = {
  [key: string]: Service<any>;
};

export type ProviderConfig = {
  useClass?: typeof Service;
  useInstance?(provider: Provider): Service<any>;
};

export type ProviderConfigs = {
  [key: string]: typeof Service | ProviderConfig;
};

// service provider
export default class Provider {
  // 父 provider
  private parent: Provider | null = null;
  // 当前 provider 上的服务实例
  private services: ProviderServices = {};
  // 当前 provider 配置
  private configs: ProviderConfigs = {};

  constructor(configs: ProviderConfigs = {}, parent: Provider | null = null) {
    this.configs = configs;
    this.parent = parent;
  }

  isRegistered(name: string): boolean {
    const names = Object.keys(this.configs);
    if (names.indexOf(name) !== -1) return true;
    if (this.parent) return this.parent.isRegistered(name);
    return false;
  }

  get(name: string): Service<any> {
    const names = Object.keys(this.configs);
    if (names.indexOf(name) !== -1) {
      if (!this.services[name]) {
        this.init(name);
      }
      return this.services[name];
    }
    const service = this.parent ? this.parent.get(name) : null;
    if (!service) {
      throw new Error(
        `The service[${name}] not be registered on this provider or any of the parent provider!`
      );
    }
    return service;
  }

  dispose(): void {
    const names = Object.keys(this.configs);
    names.forEach((name) => {
      const service = this.services[name];
      if (service) service.dispose();
    });
    this.parent = null;
    this.services = {};
    this.configs = {};
  }

  private init(name: string) {
    const config = this.configs[name];
    let service;
    if (typeof config === 'object') {
      if (config.useClass) {
        service = new config.useClass(this);
      } else if (config.useInstance) {
        service = config.useInstance(this);
      }
    } else if (typeof config === 'function') {
      // type of class is function
      service = new config(this);
    }
    if (!service) {
      throw new Error(`Error service config for [${name}]`);
    }
    this.services[name] = service;
  }
}
