declare type AnyFunction = (...args: any[]) => any;
export default class Disposable {
    private $_disposers;
    protected beforeDispose(disposer: AnyFunction): void;
    dispose(): void;
}
export {};
