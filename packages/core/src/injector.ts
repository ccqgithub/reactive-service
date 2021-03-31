import { debug } from './util';
import DINode from './di';
import InjectionToken from './token';
import {
  InjectionClass,
  InjectionDisposer,
  InjectionProvide,
  InjectionProvider,
  InjectionValue
} from './types';

type ProviderRecord = {
  provide: InjectionProvide;
  value?: any;
  useClass?: InjectionClass | null;
  useExisiting?: InjectionClass | null;
  dispose?: InjectionDisposer | null;
  useFactory?:
    | (<P extends InjectionProvide>(di: () => DINode) => InjectionValue<P>)
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

      if (
        typeof provider === 'function' &&
        typeof (provider as InjectionClass).prototype.constructor === 'function'
      ) {
        // [class]
        record = {
          provide: provider as InjectionClass
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

  isProvided(provide: InjectionProvide): boolean {
    if (this.records.has(provide)) return true;
    if (this.parent) return this.parent.isProvided(provide);
    return false;
  }

  get<P extends InjectionProvide>(
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
    const di = () => new DINode(this);

    // use class
    if (record.useClass) {
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
