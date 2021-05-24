import Vue, { PropType } from 'vue';
import { InjectionProvider, Injector } from '@reactive-service/core';
import { injectorKey } from './context';

const ServiceInjector = Vue.extend({
  props: {
    providers: { type: Object as PropType<InjectionProvider[]>, required: true }
  },
  data() {
    return {
      //
    }
  },
  template: `
    <slot />
  `
});
