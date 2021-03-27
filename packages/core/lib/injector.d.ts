import { InjectClass, InjectProvide, InjectProvider, InjectService } from './types';
export default class Injector {
    private parent;
    private records;
    constructor(providers?: InjectProvider[], parent?: Injector | null);
    isRegistered(provide: InjectProvide): boolean;
    get<S extends InjectService = InjectService>(provide: InjectProvide): S;
    private $_initClass;
    dispose(): void;
    static getParentInjector(service: InjectClass): Injector | null;
}
