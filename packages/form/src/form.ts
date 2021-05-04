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
  // 表单数据
  data$$: BehaviorSubject<D>;
  // 是否提交过
  touched$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // 正在提交
  validating$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // 错误
  errors$$: BehaviorSubject<ValidateError[]> = new BehaviorSubject<
    ValidateError[]
  >([]);
  // 表单字段
  fields$$: BehaviorSubject<Record<string, RSField<D>>>;

  get data() {
    return this.data$$.value;
  }

  get touched() {
    return this.touched$$.value;
  }

  get validating() {
    return this.validating$$.value;
  }

  get errors() {
    return this.errors$$.value;
  }

  get fields() {
    return this.fields$$.value;
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
    this.data$$ = new BehaviorSubject(data);
    this.formField = new RSField<D>(this.getFormFieldSchema(data), {
      form: this,
      namePath: '',
      index: ''
    });
    this.fields$$ = new BehaviorSubject(
      this.formField.fields as Record<string, RSField<D>>
    );
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
    this.data$$.next(newData);
    this.formField.updateSchema(schema);
    this.onChangeStatus();
    this.formField.checkValidate();
  }

  onChangeStatus() {
    const { fieldErrors } = this.formField;
    this.validating$$.next(this.formField.validating);
    this.errors$$.next([...fieldErrors]);
    this.fields$$.next({
      ...(this.formField.fields as Record<string, RSField<D>>)
    });
  }

  reset(data: D) {
    this.touched$$.next(false);
    this.data$$.next(data);
    this.formField = new RSField<D>(this.getFormFieldSchema(data), {
      form: this,
      namePath: '',
      index: ''
    });
    this.fields$$.next({
      ...(this.formField.fields as Record<string, RSField<D>>)
    });
    this.errors$$.next([...this.formField.fieldErrors]);
  }

  validate() {
    !this.touched && this.touched$$.next(true);
    return this.formField.validate();
  }

  dispose() {
    this.disposers.forEach((disposer) => {
      disposer();
    });
  }
}
