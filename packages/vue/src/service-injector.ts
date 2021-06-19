import { defineComponent, provide, inject, PropType } from 'vue';
import { InjectionProvider, Injector } from './core';
import { injectorKey } from './context';

const ServiceInjector = defineComponent({
  props: {
    providers: { type: Object as PropType<InjectionProvider[]>, required: true }
  },
  setup(props) {
    const parentInjector = inject(injectorKey);
    const injector = new Injector(props.providers, parentInjector);
    provide(injectorKey, injector);
  }
});

export default ServiceInjector;
