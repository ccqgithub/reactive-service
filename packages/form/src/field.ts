import {
  BehaviorSubject,
  concat,
  from,
  Observable,
  of,
  Subject,
  zip
} from 'rxjs';
import {
  catchError,
  concatAll,
  reduce,
  skip,
  switchMap,
  tap,
  map
} from 'rxjs/operators';
import builtinRules from './rule';
import messages from './messages';
import RSForm from './form';
import ValidateError from './error';
import {
  FieldValue,
  FieldRule,
  Schema,
  FieldErrors,
  RSFormData,
  SchemaField
} from './types';

export type RSFieldWaiting = {
  promise: Promise<ValidateError[]>;
  resolve: (errors: ValidateError[]) => void;
};

export type RSFieldChildren = {
  [fieldName: string]: RSField;
};

export type RSFieldOptions = {
  form: RSForm<any, any>;
  name: string;
  namePath: string;
  index: string;
};

export default class RSField<D extends RSFormData = RSFormData> {
  private index: string;
  private namePath: string;
  private rules: FieldRule[];
  private shouldValidate = (value: FieldValue, oldValue: FieldValue) =>
    value !== oldValue;

  fields: RSFieldChildren = {};

  value$$: BehaviorSubject<FieldValue>;
  validating$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errors$$: BehaviorSubject<ValidateError[]> = new BehaviorSubject<
    ValidateError[]
  >([]);

  validate$: Subject<any> = new Subject();

  private form: RSForm<any, any>;
  private waiting: RSFieldWaiting | null = null;
  private disposers: (() => void)[] = [];

  get value() {
    return this.value$$.value;
  }

  get errors() {
    return this.errors$$.value;
  }

  get fieldErrors() {
    const { fields } = this;
    const obj: FieldErrors = {};
    Object.keys(fields).forEach((key) => {
      obj[fields[key].index] = {
        errors: fields[key].errors,
        fields: fields[key].fieldErrors
      };
    });
    return obj;
  }

  get validating() {
    return this.validating$$.value;
  }

  constructor(schema: SchemaField, value: FieldValue, options: RSFieldOptions) {
    const { rules = [] } = schema;
    const { name, namePath, form, index } = options;

    if (typeof name === 'undefined')
      throw new Error('Need a name for RSField!');

    this.rules = rules;
    this.namePath = namePath;
    this.index = index;
    this.form = form;
    this.value$$ = new BehaviorSubject(value);

    this.updateFields(schema);

    const subscription = this.validate$
      .pipe(
        tap(() => {
          this.validating$$.next(true);
          // waiting
          const waiting: RSFieldWaiting = {} as RSFieldWaiting;
          waiting.promise = new Promise((resolve) => {
            waiting.resolve = resolve;
          });
          this.waiting = waiting;
        }),
        switchMap(() => {
          return this.validateAll();
        }),
        tap((errors) => {
          this.validating$$.next(false);
          this.errors$$.next(errors);
          this.waiting && this.waiting.resolve(errors);
        }),
        catchError((error, caught) => {
          console.log(error);
          return caught;
        })
      )
      .subscribe();
    this.disposers.push(() => {
      subscription.unsubscribe();
    });

    // errors
    // const errorsSub = this.errors$$.pipe(skip(1)).subscribe(() => {
    //   this.form.updateErrors();
    // });
    // this.disposers.push(() => {
    //   errorsSub.unsubscribe();
    // });

    // 如果表单验证过，则字段初始化时候就验证
    if (this.form.dirty) {
      this.validate$.next();
    }
  }

  private updateFields(schema: SchemaField) {
    const newFields: Record<string, FieldSchema & { index: string }> = {};
    if (Array.isArray(schema.fields)) {
      schema.fields.forEach((item, index) => {
        if (!item.name) throw new Error('Array field need a name property!');
        newFields[item.name] = { ...item, index: `${index}` };
      });
    } else if (typeof schema.fields === 'object') {
      Object.keys(schema.fields).forEach((key) => {
        newFields[key] = {
          ...(schema.fields as Record<string, FieldSchema>)[key],
          name: key,
          index: key
        };
      });
    }

    const oldKeys = Object.keys(this.fields);
    const newKeys = Object.keys(newFields);
    oldKeys.forEach((key) => {
      if (newKeys.indexOf(key) === -1) {
        this.fields[key].dispose();
        delete this.fields[key];
      }
    });
    newKeys.forEach((key) => {
      if (oldKeys.indexOf(key) === -1) {
        this.fields[key] = new RSField(
          newFields[key],
          this.getSubValue(value, newFields[key].index),
          {
            form: this.form,
            name: key,
            namePath: this.namePath
              ? `${this.namePath}.${newFields[key].index}`
              : newFields[key].index,
            index: newFields[key].index
          }
        );
      } else {
        this.fields[key].update(
          newFields[key],
          this.getSubValue(value, newFields[key].index)
        );
      }
    });
  }

  update(schema: FieldSchema, value: FieldValue) {
    const { rules = [] } = schema;

    this.rules = rules;

    const shouldValidate = this.shouldValidate(value, this.value);
    this.value$$.next(value);
    this.updateFields(schema, value);
    shouldValidate && this.validate$.next();
  }

  private validateRules() {
    const { value, rules, form } = this;

    const obArr = rules.map((rule) => {
      return this.validateRule(rule, value, form.data);
    });

    return of(...obArr).pipe(
      concatAll(),
      reduce<string[]>((prev, cur) => prev.concat(...cur), []),
      map((errors) => {
        return errors.map((err) => {
          return new ValidateError(err, true);
        });
      })
    );
  }

  private validateRule(rule: FieldRule, value: FieldValue, source: RSFormData) {
    const errors: string[] = [];
    const rules = Object.keys(builtinRules) as (keyof typeof builtinRules)[];
    rules.forEach((key) => {
      errors.push(
        ...builtinRules[key](rule, value, source, {
          messages,
          fullField: this.namePath
        })
      );
    });

    let v$: Observable<string[]> | null = null;

    if (rule.validator) {
      const res = rule.validator(rule, value, source, {
        messages,
        fullField: this.namePath
      });
      if (res instanceof Observable) {
        v$ = res;
      } else if (res instanceof Promise) {
        v$ = from(res);
      } else {
        v$ = of(res);
      }
    }

    if (v$) {
      return v$.pipe(
        map((errs) => {
          return errors.concat(...errs);
        }),
        map((errs) => {
          if (rule.message) return [rule.message];
          return errs;
        })
      );
    }

    return of(rule.message ? [rule.message] : errors);
  }

  private validateFields() {
    const { fields } = this;
    const keys = Object.keys(fields);
    const arr = keys.map((key) => {
      return fields[key].doValidate();
    });
    return zip(...arr).pipe(
      map((arr) => {
        return arr.reduce((prev, cur) => [...prev, ...cur], []);
      })
    );
  }

  private validateAll(): Observable<ValidateError[]> {
    return concat(this.validateRules(), this.validateFields());
  }

  doValidate() {
    if (!this.waiting) this.validate$.next();
    return (this.waiting as RSFieldWaiting).promise;
  }

  validate() {
    if (!this.waiting) this.validate$.next();
    return (this.waiting as RSFieldWaiting).promise;
  }

  private getSubValue(value: any, key: string | number) {
    if (typeof value !== 'object') return undefined;
    return value[key];
  }

  dispose() {
    this.disposers.forEach((disposer) => {
      disposer();
    });
    this.disposers = [];
  }
}
