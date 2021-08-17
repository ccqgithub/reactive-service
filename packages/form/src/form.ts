import { BehaviorSubject } from 'rxjs';
import Disposable from './disposable';
import Field from './field';
import { FieldRule } from './types';

export default class Form<S extends Record<string, any>> extends Disposable {
  fields: Record<string, Field<any>> = {};
  defaultValues: S;
  values: any;
  dirty = false;
  touched = false;
  validating = false;
  errors: Error[] = [];

  constructor(defaultValues: S) {
    super();
    this.defaultValues = defaultValues;
  }

  reset(defaultValues: S) {
    this.defaultValues = defaultValues;
  }

  register(namePath: string, opts: { rules: FieldRule[] }) {
    //
  }

  unregister(namePath: string) {
    //
  }

  validate() {
    //
  }
}
