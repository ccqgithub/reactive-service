import RSField from './field';
import { Schema, BuildSchema, RSFormData } from './types';

export default class RSForm<
  S extends Schema = Schema,
  D extends RSFormData = RSFormData
> {
  private schema: S | BuildSchema<S, D>;
  private form: RSField<S, D>;
  dirty = false;

  get data$$() {
    return this.form.value$$;
  }

  get data() {
    return this.form.value;
  }

  get validating$$() {
    return this.form.validating$$;
  }

  get validating() {
    return this.form.validating;
  }

  get errors$$() {
    return this.form.errors$$;
  }

  get errors() {
    return this.form.errors;
  }

  get fields() {
    return this.form.fields;
  }

  constructor(schema: S | BuildSchema<S, D>, data: D) {
    this.schema = schema;
    this.form = new RSField<S, D>(this.getFormFieldSchema(data), data, {
      form: this,
      name: '',
      namePath: '',
      index: ''
    });
  }

  private getFormFieldSchema(data: D) {
    const { schema } = this;
    const fields = typeof schema === 'function' ? schema(this.data) : schema;
    return {
      value: data,
      rules: [],
      fields
    };
  }

  update(data: Partial<D>) {
    const newData =  { ...this.data, ...data };
    const schema = this.getFormFieldSchema(newData);
    this.form.update(schema);
  }

  validate() {
    return this.form.validate();
  }
}
