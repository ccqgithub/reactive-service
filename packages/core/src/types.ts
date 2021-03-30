import Injector from './injector';
import InjectionToken from './token';

export type InjectionClass = {
  new (...args: any[]): Record<string, any>;
};

export type Injectable<C extends InjectionClass> = C & {
  prototype: {
    $rs_parentInjector?: Injector | null;
    $rs_getParentInjector?: (() => Injector | null) | null;
    dispose?: ((service: InstanceType<C>) => void) | null;
  };
};

export type MakeInjectable = <C extends InjectionClass = InjectionClass>(
  cls: C
) => Injectable<C>;

export type InjectionProvide<
  V = any,
  C extends InjectionClass = InjectionClass
> = InjectionToken<V> | C;

export type InjectionDisposer = <V = any>(service: V) => void;

export type InjectionProvider<
  V = any,
  C extends InjectionClass = InjectionClass
> =
  | InjectionProvide<V, C>
  | {
      provide: InjectionProvide<V, C>;
      useClass?: C | null;
      useValue?: V | null;
      useExisting?: C | null;
      useFactory?: ((injectable: MakeInjectable) => V) | null;
      dispose?: InjectionDisposer | null;
    };
