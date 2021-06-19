import { InjectionProvide, InjectionValue, InjectionProvider } from './types';
export default class Injector {
    private parent;
    private records;
    constructor(providers?: InjectionProvider[], parent?: Injector | null);
    isProvided(provide: InjectionProvide): boolean;
    get<P extends InjectionProvide>(provide: P, args: {
        optional: true;
    }): InjectionValue<P> | null;
    get<P extends InjectionProvide>(provide: P, args?: {
        optional?: false;
    }): InjectionValue<P>;
    private $_initRecord;
    dispose(): void;
}
//# sourceMappingURL=injector.d.ts.map