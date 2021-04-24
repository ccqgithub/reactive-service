import RSField from './field';
import { FormSchema, BuildFormSchema, RSFormData } from './types';

export default class RSForm<S extends FormSchema = FormSchema> {
  private schema: S | BuildFormSchema<S>;

  private form: RSField;
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

  constructor(schema: S | BuildFormSchema<S>, data: RSFormData) {
    this.schema = schema;
    this.form = new RSField(this.getFormFieldSchema(), data, {
      form: this,
      name: '',
      namePath: '',
      index: ''
    });
  }

  private getFormFieldSchema() {
    const { schema } = this;
    const fields = typeof schema === 'function' ? schema(this.data) : schema;
    return {
      rules: [],
      fields
    };
  }

  update(data: Partial<D>) {
    this.form.update(this.getFormFieldSchema(), { ...this.data, ...data });
  }

  validate() {
    return this.form.validate();
  }
}
