import { BehaviorSubject, Subscription } from 'rxjs';
import { setPathField } from './util/field';
import Disposable from './disposable';
import Field from './field';
import { FieldRule, KeyPathValue } from './types';

export default class Form<S extends Record<string, any>> extends Disposable {
  fields: Record<string, Field<any>> = {};
  fieldsSubMap = new WeakMap<Field<any>, Subscription>();
  defaultValues: S;
  values$: BehaviorSubject<S>;
  dirty = false;
  touched = false;
  validating = false;
  errors: Error[] = [];

  constructor(defaultValues: S) {
    super();
    this.defaultValues = defaultValues;
    this.values$ = new BehaviorSubject<S>(defaultValues);
  }

  get values() {
    return this.values$.value;
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
        this.values$.next(setPathField(this.values, keyPath, state.value));
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

  validate() {
    //
  }
}
