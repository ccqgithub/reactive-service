import { InjectionContext } from './types';
export default class InjectionToken<V = any> {
    private _desc;
    factory?: ((ctx: InjectionContext) => V) | null;
    constructor(desc: string, options?: {
        factory: (ctx: InjectionContext) => V;
    });
    toString(): string;
}
//# sourceMappingURL=token.d.ts.map