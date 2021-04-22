import InjectionToken from './token';

export type InjectionClass = Record<string, any>;

export type InjectionConstructor = {
  new (...args: any[]): InjectionClass;
};

export type InjectionProvide = InjectionToken | InjectionConstructor;

export type InjectionValue<
  P extends InjectionProvide
> = P extends InjectionToken<infer V>
  ? V
  : P extends InjectionConstructor
  ? InstanceType<P>
  : never;

export type InjectionDisposer = <P extends InjectionProvide = InjectionProvide>(
  service: InjectionValue<P>
) => void;

export type InjectionProviderObj = {
  provide: InjectionProvide;
  useValue?: any;
  useClass?: InjectionConstructor | null;
  useExisting?: InjectionProvide | null;
  useFactory?:
    | ((ctx: InjectionContext) => InjectionValue<InjectionProvide>)
    | null;
  dispose?: InjectionDisposer | null;
};

export type InjectionProvider = InjectionProvide | InjectionProviderObj;

export type InjectionContext = {
  useService: GetService;
};

export interface GetService {
  <P extends InjectionProvide>(
    provide: P,
    opts: { optional: true }
  ): InjectionValue<P> | null;
  <P extends InjectionProvide>(
    provide: P,
    opts?: { optional?: false }
  ): InjectionValue<P>;
}
