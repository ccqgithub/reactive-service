import { InjectorClass, InjectorProvide, InjectorProvider, InjectorService } from './types';
export default class Injector {
    private parent;
    private records;
    constructor(providers?: InjectorProvider[], parent?: Injector | null);
    isRegistered(provide: InjectorProvide): boolean;
    get(provide: InjectorProvide): InjectorService;
    private $_initClass;
    dispose(): void;
    static getParentInjector(instance: InstanceType<InjectorClass>): Injector | null;
}
