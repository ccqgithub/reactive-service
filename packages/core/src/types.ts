import InjectionToken from './token';

export type ConstructorType<C> = {
  new (...args: any[]): C;
};

export type InjectionClass = {
  dispose?: (() => void) | null;
};

export type InjectionProvide = InjectionToken | InjectionClass;

export type InjectionValue<
  P extends InjectionProvide
> = P extends InjectionToken<infer V> ? V : P;

export type InjectionDisposer = <P extends InjectionProvide = InjectionProvide>(
  service: InjectionValue<P>
) => void;

export type InjectionGet = <P extends InjectionProvide>(
  provide: P,
  opts?: { optional?: boolean }
) => InjectionValue<P> | null;

export type InjectionProvider = {
  provide: InjectionProvide;
  useValue?: any;
  useClass?: ConstructorType<InjectionClass> | null;
  useExisting?: InjectionProvide | null;
  useFactory?:
    | ((inject: InjectionGet) => InjectionValue<InjectionProvide>)
    | null;
  deps?: InjectionProvide[];
  dispose?: InjectionDisposer | null;
};
