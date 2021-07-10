import { App } from 'vue';
import InjectionToken from './token';
export declare type InjectionClass = Record<string, any>;
export declare type InjectionConstructor<T = InjectionClass> = {
    new (...args: any[]): T;
};
export declare type InjectionAbstractConstructor<T = InjectionClass> = Function & {
    prototype: T;
};
export declare type InjectionProvide = InjectionToken | InjectionConstructor | InjectionAbstractConstructor;
export declare type InjectionValue<P extends InjectionProvide> = P extends InjectionToken<infer V> ? V : P extends {
    prototype: infer C;
} ? C : never;
export declare type InjectionDisposer = <P extends InjectionProvide = InjectionProvide>(service: InjectionValue<P>) => void;
export declare type InjectionProviderObj = {
    provide: InjectionProvide;
    useValue?: any;
    useClass?: InjectionConstructor | null;
    useExisting?: InjectionProvide | null;
    useFactory?: ((ctx: InjectionContext) => InjectionValue<InjectionProvide>) | null;
    dispose?: InjectionDisposer | null;
};
export declare type InjectionProvider = InjectionProvide | InjectionProviderObj;
export declare type InjectionContext = {
    app: App<Element>;
    useService: GetService;
};
export interface GetService {
    <P extends InjectionProvide>(provide: P, opts: {
        optional: true;
    }): InjectionValue<P> | null;
    <P extends InjectionProvide>(provide: P, opts?: {
        optional?: false;
    }): InjectionValue<P>;
}
//# sourceMappingURL=types.d.ts.map