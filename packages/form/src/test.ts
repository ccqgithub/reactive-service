import { from, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

type FieldState<T> = {
  value: T;
  valid: boolean;
  dirty: boolean;
  touched: boolean;
  validating: boolean;
  errors: Error[];
};

class Field<T> {
  state$: BehaviorSubject<FieldState<T>>;
  private validate$: Subject<void> = new Subject();
  private rules: any[] = [];
  private sub: Subscription | null = null;

  constructor(args: { rules: any[]; defaultValue: T }) {
    const { rules = [], defaultValue } = args;

    this.rules = rules;
    this.state$ = new BehaviorSubject<FieldState<T>>({
      value: defaultValue,
      valid: true,
      dirty: false,
      touched: false,
      validating: false,
      errors: []
    });

    this.internalReset({ defaultValue }, true);
  }

  private validateRules() {
    return Promise.resolve([] as Error[]);
  }

  private internalReset(args: { defaultValue: T }, init = false) {
    const { defaultValue } = args;

    if (this.sub) this.sub.unsubscribe();
    this.sub = this.validate$
      .pipe(
        tap(() => {
          this.updateState({ validating: true });
        }),
        switchMap(() => {
          return from(this.validateRules());
        }),
        tap((errs) => {
          this.updateState({
            validating: false,
            errors: errs,
            valid: !errs.length
          });
        })
      )
      .subscribe();

    if (!init) {
      this.state$.next({
        value: defaultValue,
        valid: true,
        dirty: false,
        touched: false,
        validating: false,
        errors: []
      });
    }
  }

  private updateState(s: Partial<FieldState<T>>) {
    this.state$.next({
      ...this.state$.value,
      ...s
    });
  }

  setTouched() {
    this.updateState({
      touched: true
    });
  }

  setValue(value: T) {
    this.updateState({
      value: value,
      dirty: true
    });
    this.validate$.next();
  }

  reset(args: { defaultValue: T }) {
    this.internalReset(args);
  }

  validate() {}
}
