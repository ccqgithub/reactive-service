import Injector from './injector';
export declare type InjectClass = {
    $_parentInjector?: Injector | null;
    $_getParentInjector?: ((service: InjectClass) => Injector | null) | null;
};
export declare type InjectClassConstructor = {
    new (...args: any[]): InjectClass;
};
export declare type InjectProvide = any;
export declare type InjectService = any;
export declare type InjectDisposer<S extends InjectService = InjectService> = (service: S) => void;
export declare type InjectProvider = InjectClassConstructor | {
    provide: InjectProvide;
    useClass?: InjectClassConstructor | null;
    useValue?: InjectService | null;
    dispose?: InjectDisposer | null;
};
