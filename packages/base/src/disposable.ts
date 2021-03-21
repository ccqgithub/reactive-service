type AnyFunction = (...args: any[]) => any;

export default class Disposable {
  private $_disposers: AnyFunction[] = [];

  protected beforeDispose(disposer: AnyFunction): void {
    this.$_disposers.push(disposer);
  }

  dispose(): void {
    this.$_disposers.forEach((disposer) => {
      disposer();
    });
  }
}
