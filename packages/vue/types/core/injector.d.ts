import { App } from 'vue';
import { InjectionProvide, InjectionValue, InjectionProvider } from './types';
export default class Injector {
    private parent;
    private records;
    app: App<Element>;
    constructor(providers: InjectionProvider[], opts: {
        parent: Injector | null;
        app: App<Element>;
    });
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