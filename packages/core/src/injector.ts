import 'reflect-metadata';

import { debug } from './util';
import InjectionToken from './token';
import { Inject, injectMetadataKey, InjectMetadata } from './inject';
import {
  InjectionClass,
  InjectionDisposer,
  InjectionProvider,
  InjectionValue,
  InjectionGet,
  ConstructorType
} from './types';

type ProviderRecord = {
  provide: InjectionClass;
  value?: any;
  useClass?: ConstructorType<InjectionClass> | null;
  useExisiting?: InjectionClass | null;
  dispose?: InjectionDisposer | null;
  useFactory?:
    | (<P extends InjectionClass>(inject: InjectionGet) => InjectionValue<P>)
    | null;
};
type ProviderRecords = Map<InjectionClass, ProviderRecord>;

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

      if (
        typeof provider === 'function' &&
        typeof (provider as ConstructorType<InjectionClass>).prototype
          .constructor === 'function'
      ) {
        // [class]
        record = {
          provide: provider as InjectionClass,
          useClass: provider as ConstructorType<InjectionClass>
        };
      } else if (typeof provider === 'object') {
        const { useValue, ...rest } = provider;
        // [{ provide, ...}]
        record = {
          ...rest,
          value: useValue
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

  isProvided(provide: InjectionClass): boolean {
    if (this.records.has(provide)) return true;
    if (this.parent) return this.parent.isProvided(provide);
    return false;
  }

  get<P extends InjectionClass>(
    provide: P,
    opts: { optional: boolean } = { optional: false }
  ): InjectionValue<P> | null {
    if (!this.isProvided(provide) && !opts.optional) {
      debug(provide, 'error');
      throw new Error(
        `Service of this provide not be registered on this injector or any of the parent injectors!`
      );
    }

    // no provider
    const record = this.records.get(provide);
    if (!record) return null;

    // lazy init service
    if (typeof record.value === 'undefined') {
      this.$_initRecord(record);
    }

    return record.value || null;
  }

  private $_initRecord(record: ProviderRecord): void {
    // use class
    if (record.useClass) {
      const metadata: InjectMetadata[] =
        Reflect.getOwnMetadata(injectMetadataKey, record.useClass) || [];
      const args = metadata.forEach((item, i) => {
        if (typeof item !== 'object') return undefined;
        const { provide, optional } = item;
        const service = this.get(provide);
      });

      record.value = new record.useClass(di()) as InjectionValue<
        typeof record.useClass
      >;
      return;
    }

    // alias: use exisiting
    if (record.useExisiting) {
      record.value = this.get(record.useExisiting) as InjectionValue<
        typeof record.provide
      >;
      return;
    }

    // use factory
    if (record.useFactory) {
      record.value = record.useFactory<typeof record.provide>(di);
    }

    // injection token's default value
    if (record.provide instanceof InjectionToken && record.provide.factory) {
      record.value = record.provide.factory(this);
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
