import InjectionToken from './token';

export type InjectionClass = Record<string, any>;

export type InjectionConstructor = {
  new (...args: any[]): InjectionClass;
};

export type InjectionProvide = InjectionToken | InjectionConstructor;

export type InjectionValue<
  P extends InjectionProvide
> = P extends InjectionToken<infer V> ? V : InstanceType<InjectionConstructor>;

export type InjectionDisposer = <P extends InjectionProvide = InjectionProvide>(
  service: InjectionValue<P>
) => void;

export type InjectionGet = <P extends InjectionProvide>(
  provide: P,
  opts?: { optional?: boolean }
) => InjectionValue<P> | null;

export type InjectionProviderObj = {
  provide: InjectionProvide;
  useValue?: any;
  useClass?: InjectionConstructor | null;
  useExisting?: InjectionProvide | null;
  useFactory?:
    | ((inject: InjectionGet) => InjectionValue<InjectionProvide>)
    | null;
  dispose?: InjectionDisposer | null;
};

export type InjectionProvider = InjectionProvide | InjectionProviderObj;
