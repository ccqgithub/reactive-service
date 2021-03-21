import { debug } from './config';
import {
  InjectorClass,
  InjectorProvide,
  InjectorProvider,
  InjectorService
} from './types';

type AnyFunction = (...args: any[]) => any;

type ProviderRecord = {
  value: InjectorService | null;
  useClass?: InjectorClass | null;
  dispose?: AnyFunction | null;
};

type ProviderRecords = Map<InjectorProvide, ProviderRecord>;

// service injector
export default class Injector {
  // 父 injector
  private parent: Injector | null = null;
  // 当前 injector 上的服务记录
  private records: ProviderRecords = new Map();

  constructor(
    providers: InjectorProvider[] = [],
    parent: Injector | null = null
  ) {
    this.parent = parent;
    // provider records
    providers.forEach((provider) => {
      let record: ProviderRecord;
      let provide: InjectorProvide;

      if (
        typeof provider === 'object' &&
        typeof provider.provide !== 'undefined' &&
        (provider.useClass || provider.useValue)
      ) {
        provide = provider.provide;
        record = {
          value: provider.useValue || null,
          useClass: provider.useClass || null,
          dispose: provider.dispose || null
        };
      } else if (typeof provider === 'function') {
        provide = provider;
        record = {
          value: null,
          useClass: provider,
          dispose: null
        };
      } else {
        debug(provider);
        throw new Error('Error provider onfig!');
      }

      this.records.set(provide, record);
    });
  }

  isRegistered(provide: InjectorProvide): boolean {
    if (this.records.has(provide)) return true;
    if (this.parent) return this.parent.isRegistered(provide);
    return false;
  }

  get(provide: InjectorProvide): InjectorService {
    const record = this.records.get(provide);

    if (!record) {
      debug(provide);
      throw new Error(
        `The service not be registered on this injector or any of the parent injector!`
      );
    }

    if (!record.value) {
      // 如果没有 value，则一定有 useClass
      record.value = this.$_initClass(record.useClass as InjectorClass);
    }

    return record.value as InjectorService;
  }

  private $_initClass(useClass: InjectorClass) {
    // 实例化类的时候，绑定一个parent injector（this injector），这样的话，这个类在内部依赖其他服务的时候，就能使用它
    const lastGetParentInjector =
      useClass.prototype.$_getParentInjector || null;
    useClass.prototype.$_getParentInjector = () => {
      return this;
    };
    const instance = new useClass();
    instance.$_parentInjector = this;
    useClass.prototype.$_getParentInjector = lastGetParentInjector;

    return instance;
  }

  dispose(): void {
    for (const [, record] of this.records) {
      if (record.dispose) {
        record.dispose(record.value);
      } else if (typeof record.dispose === 'function') {
        (record.dispose as AnyFunction)();
      }
    }
    this.parent = null;
    this.records.clear();
  }

  // 在服务内获取父Injector
  static getParentInjector(
    instance: InstanceType<InjectorClass>
  ): Injector | null {
    let parentInjector = null;

    if (typeof instance.$_parentInjector === 'object') {
      parentInjector = instance.$_parentInjector;
    } else if (typeof instance.$_getParentInjector === 'function') {
      parentInjector = instance.$_getParentInjector(instance);
    }

    return parentInjector;
  }
}
