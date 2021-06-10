import { BehaviorSubject } from 'rxjs';
import RSField from './field';
import ValidateError from './error';
import { FieldSchema, BuildFormSchema, RSFormData } from './types';

type RSFormOptions = {
  validateOnlyFormTouched?: boolean;
  validateOnFieldTouched?: boolean;
  firstRuleError?: boolean;
};

export default class RSForm<D extends RSFormData = RSFormData> {
  private buildSchema: BuildFormSchema<D>;
  private formField: RSField<D>;
  private disposers: (() => void)[] = [];

  // options
  options: RSFormOptions;

  $$: {
    data: BehaviorSubject<D>;
    touched: BehaviorSubject<boolean>;
    validating: BehaviorSubject<boolean>;
    errors: BehaviorSubject<ValidateError[]>;
    fields: BehaviorSubject<Record<string, RSField<D>>>;
  };

  get data() {
    return this.$s.data.value;
  }

  get touched() {
    if (!this.$$) return false;
    return this.$s.touched.value;
  }

  get validating() {
    return this.$s.validating.value;
  }

  get errors() {
    return this.$s.errors.value;
  }

  get fields() {
    return this.$s.fields.value;
  }

  get canValidate() {
    return !(!this.touched && this.options.validateOnlyFormTouched);
  }

  constructor(
    buildSchema: BuildFormSchema<D>,
    data: D,
    options: RSFormOptions = {}
  ) {
    const {
      validateOnlyFormTouched = false,
      validateOnFieldTouched = false,
      firstRuleError = true
    } = options;

    this.options = {
      validateOnlyFormTouched,
      validateOnFieldTouched,
      firstRuleError
    };
    this.buildSchema = buildSchema;

    this.formField = new RSField<D>(this.getFormFieldSchema(data), {
      form: this,
      namePath: '',
      index: ''
    });

    this.$$ = {
      data: new BehaviorSubject(data),
      touched: new BehaviorSubject<boolean>(false),
      validating: new BehaviorSubject<boolean>(false),
      errors: new BehaviorSubject<ValidateError[]>([]),
      fields: new BehaviorSubject(
        this.formField.fields as Record<string, RSField<D>>
      )
    };
  }

  private getFormFieldSchema(data: D): FieldSchema<D> {
    const { buildSchema } = this;
    const fields = buildSchema(data);
    return {
      ruleValue: data,
      rules: [],
      fields,
      reducer: (data, v) => v
    };
  }

  onUpdate(data: Partial<D>) {
    const newData = { ...this.data, ...data };
    const schema = this.getFormFieldSchema(newData);
    this.$s.data.next(newData);
    this.formField.updateSchema(schema);
    this.onChangeStatus();
    this.formField.checkValidate();
  }

  onChangeStatus() {
    const { fieldErrors } = this.formField;
    this.$s.validating.next(this.formField.validating);
    this.$s.errors.next([...fieldErrors]);
    this.$s.fields.next({
      ...(this.formField.fields as Record<string, RSField<D>>)
    });
  }

  reset(data: D) {
    this.$s.touched.next(false);
    this.$s.data.next(data);
    this.formField = new RSField<D>(this.getFormFieldSchema(data), {
      form: this,
      namePath: '',
      index: ''
    });
    this.$s.fields.next({
      ...(this.formField.fields as Record<string, RSField<D>>)
    });
    this.$s.errors.next([...this.formField.fieldErrors]);
  }

  validate() {
    !this.touched && this.$s.touched.next(true);
    return this.formField.validate();
  }

  dispose() {
    this.disposers.forEach((disposer) => {
      disposer();
    });
  }
}
