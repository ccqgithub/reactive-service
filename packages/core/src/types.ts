import Injector from './injector';

export type InjectClass = {
  $_parentInjector?: Injector | null;
  $_getParentInjector?: ((service: InjectClass) => Injector | null) | null;
  dispose?: InjectDisposer;
};

export type InjectClassConstructor = {
  new (...args: any[]): InjectClass;
};

export type InjectProvide = InjectClassConstructor;

export type InjectService = InjectClass;

export type InjectDisposer<S extends InjectService = InjectService> = (
  service: S
) => void;

export type InjectProvider =
  | InjectClassConstructor
  | {
      provide: InjectProvide;
      useClass?: InjectClassConstructor | null;
      useValue?: InjectService | null;
      dispose?: InjectDisposer | null;
    };
