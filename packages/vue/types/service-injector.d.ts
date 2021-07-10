import { PropType } from 'vue';
import { InjectionProvider } from './core';
declare const ServiceInjector: import("vue").DefineComponent<{
    providers: {
        type: PropType<InjectionProvider[]>;
        required: true;
    };
}, void, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    providers?: unknown;
} & {
    providers: InjectionProvider[];
} & {}>, {}>;
export default ServiceInjector;
//# sourceMappingURL=service-injector.d.ts.map