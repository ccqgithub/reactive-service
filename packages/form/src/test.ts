import { from, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

type FieldState<T> = {
  value: T;
  valid: boolean;
  dirty: boolean;
  touched: boolean;
  validating: boolean;
  errors: Error[];
};

type FieldResolve<T> = (state: FieldState<T>) => void;

type setValueOptions = {
  shouldDirty?: boolean;
};

class Field<T> {
  state$: BehaviorSubject<FieldState<T>>;
  private waitings: FieldResolve<T>[] = [];
  private lastValidate?: T;
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

  get state() {
    return this.state$.value;
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
          this.lastValidate = this.state.value;
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
          this.waitings.forEach((resolve) => {
            resolve(this.state);
          });
          this.waitings = [];
        }),
        catchError((err, caught) => {
          console.error && console.error(err);
          return caught;
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

  setValue(v: T, args: setValueOptions = {}) {
    const { value } = this.state;
    const dirty = value !== v;
    const { shouldDirty = dirty } = args;

    this.updateState({
      value: value,
      dirty: shouldDirty
    });

    if (dirty) this.validate();
  }

  reset(args: { defaultValue: T }) {
    this.internalReset(args);
  }

  validate() {
    const { lastValidate, state } = this;
    const { value } = state;
    const needValidate = lastValidate !== value;

    const promise = new Promise<FieldState<T>>((resolve) => {
      if (needValidate) {
        this.waitings.push(resolve);
      } else {
        resolve(state);
      }
    });
    if (needValidate) this.validate$.next();

    return promise;
  }
}

export default Field;
