import { Injector } from '@reactive-service/core';
import { injectorKey, instanceInjectorKey } from './context';

declare module 'vue/types/vue' {
  interface Vue {
    [injectorKey]: Injector;
    [instanceInjectorKey]: Injector;
  }
}
