export declare type Disposer = () => void;
export default class Disposable {
    private $_disposers;
    protected beforeDispose(disposer: Disposer): void;
    dispose(): void;
}
//# sourceMappingURL=disposable.d.ts.map