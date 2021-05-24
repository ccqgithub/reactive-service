import Vue, { VueConstructor } from 'vue';
import {
  GetService,
  Injector,
  InjectionProvider,
  InjectionProvide,
  InjectionValue
} from '@reactive-service/core';
import { BehaviorSubject, Observable, PartialObserver } from 'rxjs';

import { injectorKey, instanceInjectorKey, InstanceWithInjector } from './context';

type UserServiceOpts = {
  optional?: boolean;
};
type UserServiceResult<P extends InjectionProvide, O extends UserServiceOpts> =
  O extends { optional: true } ? InjectionValue<P> | null : InjectionValue<P>;

const Plugin = {
  install(V: VueConstructor, options) {
    V.mixin({
      inject: {
        injectorKey
      },
      methods: {
        useService<P extends InjectionProvide, O extends UserServiceOpts>(
          this: InstanceWithInjector,
          provide: P,
          opts?: O
        ): UserServiceResult<P, O> {
          const injector = this[injectorKey];
          return injector.get(provide, opts);
        }
      }
    });
  }
};

export default Plugin;
