import InjectionToken from './token';

export type ConstructorType<C> = {
  new (...args: any[]): C;
};

export type InjectionClass = {
  dispose?: (() => void) | null;
};

export type InjectionValue<P extends InjectionClass> = P extends InjectionToken<
  infer V
>
  ? V
  : P;

export type InjectionDisposer<P extends InjectionClass> = (
  service: InjectionValue<P>
) => void;

export type InjectionGet = <P extends InjectionClass>(
  provide: P
) => InjectionValue<P>;

export type InjectionProvider<P extends InjectionClass = InjectionClass> = {
  provide: P;
  useValue?: InjectionValue<P>;
  useClass?: ConstructorType<P> | null;
  useExisting?: P | null;
  useFactory?: ((inject: InjectionGet) => InjectionValue<P>) | null;
  deps?: InjectionClass[];
  dispose?: InjectionDisposer<P> | null;
};
