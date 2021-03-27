import { debug } from './util';
import {
  InjectClass,
  InjectProvide,
  InjectProvider,
  InjectService,
  InjectDisposer,
  InjectClassConstructor
} from './types';

type ProviderRecord = {
  value: InjectService | null;
  useClass?: InjectClassConstructor | null;
  dispose?: InjectDisposer | null;
};
type ProviderRecords = Map<InjectProvide, ProviderRecord>;

// service injector
export default class Injector {
  // 父 injector
  private parent: Injector | null = null;
  // 当前 injector 上的服务记录
  private records: ProviderRecords = new Map();

  constructor(
    providers: InjectProvider[] = [],
    parent: Injector | null = null
  ) {
    this.parent = parent;
    // provider records
    providers.forEach((provider) => {
      let record: ProviderRecord;
      let provide: InjectProvide;

      if (
        typeof provider === 'object' &&
        typeof provider.provide !== 'undefined' &&
        (provider.useClass || provider.useValue)
      ) {
        // provider is a config object
        provide = provider.provide;
        record = {
          value: provider.useValue || null,
          useClass: provider.useClass || null,
          dispose: provider.dispose || null
        };
      } else if (typeof provider === 'function') {
        // provider is a class
        provide = provider;
        record = {
          value: null,
          useClass: provider,
          dispose: null
        };
      } else {
        // error provider config
        debug(provider);
        throw new Error('Error provider onfig!');
      }

      this.records.set(provide, record);
    });
  }

  isRegistered(provide: InjectProvide): boolean {
    if (this.records.has(provide)) return true;
    if (this.parent) return this.parent.isRegistered(provide);
    return false;
  }

  get<S extends InjectService = InjectService>(provide: InjectProvide): S {
    const record = this.records.get(provide);
    let service;

    if (record && !record.value && record.useClass) {
      service = this.$_initClass(record.useClass);
      record.value = service;
    }

    if (!record || !record.value) {
      debug(provide, 'error');
      throw new Error(
        `The service not be registered on this injector or any of the parent injector!`
      );
    }

    return record.value;
  }

  private $_initClass(useClass: InjectClassConstructor): InjectClass {
    // 实例化类的时候，绑定一个parent injector（this injector），这样的话，这个类在内部依赖其他服务的时候，就能使用它
    const lastGetParentInjector =
      useClass.prototype.$_getParentInjector || null;
    useClass.prototype.$_getParentInjector = () => {
      return this;
    };
    const service = new useClass();
    service.$_parentInjector = this;
    service.$_getParentInjector = null;
    useClass.prototype.$_getParentInjector = lastGetParentInjector;

    return service;
  }

  dispose(): void {
    for (const [, record] of this.records) {
      if (!record.value) return;
      if (record.dispose) {
        record.dispose(record.value);
      } else if (typeof record.value.dispose === 'function') {
        (record.value.dispose as InjectDisposer)(record.value);
      }
    }
    this.parent = null;
    this.records.clear();
  }

  // 在服务内获取父Injector
  static getParentInjector(service: InjectClass): Injector | null {
    let parentInjector = null;

    if (typeof service.$_parentInjector === 'object') {
      // 实例已经创建时
      parentInjector = service.$_parentInjector;
    } else if (typeof service.$_getParentInjector === 'function') {
      // 还在执行构造函数中时
      parentInjector = service.$_getParentInjector(service);
    }

    return parentInjector;
  }
}
