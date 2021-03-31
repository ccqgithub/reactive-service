import InjectionToken from './token';
import DINode from './di';

export type InjectionClass = {
  dispose?: (() => void) | null;
};

export type InjectionValue<P extends InjectionClass> = P extends InjectionToken<
  infer V
>
  ? V
  : P;

export type InjectionDisposer = <P extends InjectionClass>(
  service: InjectionValue<P>
) => void;

export type InjectionProvider = {
  provide: InjectionClass;
  useValue?: any;
  useClass?: InjectionClass | null;
  useExisting?: InjectionClass | null;
  useFactory?:
    | (<P extends InjectionClass>(di: () => DINode) => InjectionValue<P>)
    | null;
  dispose?: InjectionDisposer | null;
};
