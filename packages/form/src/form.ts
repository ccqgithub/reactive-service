import { BehaviorSubject, Subscription } from 'rxjs';
import ValidateError from './error';
import { setPathField, getPathField } from './util/field';
import Disposable from './disposable';
import Field from './field';
import { FieldRule, KeyPathValue } from './types';

export type FormState<S extends Record<string, any>> = {
  values: S;
  valid: boolean;
  dirty: boolean;
  touched: boolean;
  validating: boolean;
  errors: ValidateError[];
};

export type FormResolve<S> = (state: FormState<S>) => void;

export default class Form<S extends Record<string, any>> extends Disposable {
  fields: Record<string, Field<any>> = {};
  fieldsSubMap = new WeakMap<Field<any>, Subscription>();
  defaultValues: S;
  state$: BehaviorSubject<FormState<S>>;
  private waitings: FormResolve<S>[] = [];

  constructor(defaultValues: S) {
    super();
    this.defaultValues = defaultValues;
    this.state$ = new BehaviorSubject<FormState<S>>({
      values: defaultValues,
      valid: true,
      dirty: false,
      touched: false,
      validating: false,
      errors: []
    });
  }

  get state() {
    return this.state$.value;
  }

  reset(defaultValues: S) {
    this.defaultValues = defaultValues;
  }

  register<P extends string>(
    keyPath: P,
    opts: { defaultValue: KeyPathValue<S, P>; rules: FieldRule[] }
  ) {
    const field = new Field({
      name: keyPath,
      defaultValue: opts.defaultValue,
      rules: opts.rules
    });
    this.fields[keyPath] = field;
    const sub = field.state$.subscribe({
      next: (state) => {
        this.updateState(keyPath, state);
      }
    });
    this.fieldsSubMap.set(field, sub);
  }

  unregister(keyPath: string) {
    const filed = this.fields[keyPath];
    if (filed) {
      const sub = this.fieldsSubMap.get(filed);
      if (sub) sub.unsubscribe();
      filed.dispose();
      delete this.fields[keyPath];
    }
  }

  validate(force = false) {
    const keys = Object.keys(this.fields);
    keys.forEach((key) => {
      this.fields[key].validate(force);
    });

    const promise = new Promise<FormState<S>>((resolve) => {
      if (this.state.validating) {
        this.waitings.push(resolve);
      } else {
        resolve(this.state);
      }
    });

    return promise;
  }

  private updateState(keyPath: string, fieldState: Field<any>['state']) {
    const { state } = this;
    const { values } = state;
    let newValues = values;

    const lastValue = getPathField(values, keyPath);
    if (fieldState.value !== lastValue) {
      newValues = { ...values };
      setPathField(newValues, keyPath, fieldState.value);
    }

    const keys = Object.keys(this.fields);
    let valid = true;
    let dirty = false;
    let touched = false;
    let validating = false;
    let errors: ValidateError[] = [];
    keys.forEach((key) => {
      const field = this.fields[key];
      if (!field.state.valid) valid = false;
      if (!field.state.dirty) dirty = true;
      if (!field.state.touched) touched = true;
      if (!field.state.validating) validating = true;
      errors = [...errors, ...field.state.errors];
    });

    // valid status not change, no need update errors
    if (valid && state.valid) {
      errors = state.errors;
    }

    this.state$.next({
      ...state,
      valid,
      dirty,
      touched,
      validating,
      errors
    });

    if (!this.state.validating) {
      this.waitings.forEach((resolve) => {
        resolve(this.state);
      });
      this.waitings = [];
    }
  }
}
