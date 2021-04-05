import 'reflect-metadata';

import { debug } from './util';
import InjectionToken from './token';
import { injectMetadataKey, InjectMetadata } from './inject';
import {
  InjectionProvide,
  InjectionValue,
  InjectionDisposer,
  InjectionProvider,
  InjectionProviderObj,
  InjectionGet,
  InjectionConstructor
} from './types';

type ProviderRecord = {
  provide: InjectionProvide;
  value?: any;
  useClass?: InjectionConstructor | null;
  useExisiting?: InjectionProvide | null;
  dispose?: InjectionDisposer | null;
  useFactory?:
    | (<P extends InjectionProvide>(inject: InjectionGet) => InjectionValue<P>)
    | null;
};
type ProviderRecords = Map<InjectionProvide, ProviderRecord>;

// service injector
export default class Injector {
  // parent injector
  private parent: Injector | null = null;
  // 当前 injector 上的服务记录
  private records: ProviderRecords = new Map();

  constructor(
    providers: InjectionProvider[] = [],
    parent: Injector | null = null
  ) {
    this.parent = parent;
    // provider records
    providers.forEach((provider) => {
      let record: ProviderRecord | null = null;

      if (typeof provider === 'object') {
        // [{ provide, ...}]
        const p = provider as InjectionProviderObj;
        // check
        const keys = ['useValue', 'useClass', 'useExisiting', 'useFactory'];
        let apear = 0;
        keys.forEach((key) => {
          if (typeof p[key as keyof InjectionProviderObj] !== 'undefined') {
            apear++;
          }
        });
        if (apear > 1) {
          debug(
            `These keys [${keys.join(
              ','
            )}] can only use one, other will be ignored!`,
            'warn'
          );
        }
        // normalize
        const { useValue = null, ...rest } = p;
        record = {
          ...rest,
          value: useValue
        };
      } else if (
        typeof provider === 'function' &&
        typeof (provider as InjectionConstructor).prototype.constructor ===
          'function'
      ) {
        // [class]
        const p = provider as InjectionProvide;
        record = {
          provide: p,
          useClass: p as InjectionConstructor
        };
      }

      if (!record) {
        debug(provider);
        throw new Error('Error provider onfig!');
      }

      const hasTokenFactory =
        record.provide instanceof InjectionToken && record.useFactory;
      if (
        typeof record.value === 'undefined' &&
        !record.useClass &&
        !record.useExisiting &&
        !record.useFactory &&
        !hasTokenFactory
      ) {
        debug(provider);
        throw new Error('Error provider onfig!');
      }

      this.records.set(record.provide, record);
    });
  }

  isProvided(provide: InjectionProvide): boolean {
    if (this.records.has(provide)) return true;
    if (this.parent) return this.parent.isProvided(provide);
    return false;
  }

  get<P extends InjectionProvide>(provide: P): InjectionValue<P> | null {
    const record = this.records.get(provide);

    // not register on self
    if (!record) {
      if (this.parent) return this.parent.get(provide);
      return null;
    }

    // lazy init service
    if (typeof record.value === 'undefined') {
      this.$_initRecord(record);
    }

    return record.value || null;
  }

  private $_initRecord(record: ProviderRecord): void {
    // token 中的 factory 优先
    // injection token's default value
    if (record.provide instanceof InjectionToken && record.provide.factory) {
      const inject: InjectionGet = (provide, opts = {}) => {
        const { optional } = opts;
        const service = this.get(provide);

        if (!service && !optional) {
          debug(record);
          debug(InjectionToken);
          throw new Error(
            `Can not find all deps in the DI tree when init the InjectionToken, please provide them before you use the InjectionToken's factory!`
          );
        }

        return service;
      };
      record.value = record.provide.factory(inject);
    }

    // use class
    if (record.useClass) {
      // find deps for the useClass
      const metadata: InjectMetadata<InjectionProvide>[] =
        Reflect.getOwnMetadata(injectMetadataKey, record.useClass) || [];
      const deps = metadata.map((item) => {
        if (typeof item !== 'object') return undefined;
        const { provide, optional } = item;
        const service = this.get(provide);

        if (!service && !optional) {
          debug(record);
          throw new Error(
            `Can not find all deps in the DI tree when init the useClass, please provide them before you use the useClass!`
          );
        }

        return service;
      });

      record.value = new record.useClass(...deps);
      return;
    }

    // alias: use exisiting
    if (record.useExisiting) {
      record.value = this.get(record.useExisiting);
      return;
    }

    // use factory
    if (record.useFactory) {
      const inject: InjectionGet = (provide, opts = {}) => {
        const { optional } = opts;
        const service = this.get(provide);

        if (!service && !optional) {
          debug(record);
          throw new Error(
            `Can not find all deps in the DI tree when init the useFactory, please provide them before you use the useFactory!`
          );
        }

        return service;
      };
      record.value = record.useFactory<typeof record.provide>(inject);
    }
  }

  dispose(): void {
    for (const [, record] of this.records) {
      if (!record.value) return;
      if (record.dispose) {
        record.dispose(record.value);
      } else if (typeof record.value.dispose === 'function') {
        record.value.dispose();
      }
    }
    this.parent = null;
    this.records.clear();
  }
}
