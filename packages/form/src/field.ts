import { concat, EMPTY, from, Observable, of, Subject, zip } from 'rxjs';
import {
  catchError,
  reduce,
  switchMap,
  tap,
  map,
  concatMap
} from 'rxjs/operators';
import builtinRules from './rule';
import messages from './messages';
import RSForm from './form';
import ValidateError from './error';
import { RSFormData, FieldRule, FieldSchema } from './types';

export type RSFieldWaiting = {
  promise: Promise<ValidateError[]>;
  resolve: (errors: ValidateError[]) => void;
};

export type RSFieldOptions<D> = {
  parent?: RSField<D>;
  form: RSForm<D>;
  namePath: string;
  index: string;
};

export default class RSField<D extends RSFormData> {
  private namePath: string;
  private ruleValue: any;
  private rules: FieldRule[];
  private reducer: (data: D, value: any) => D;

  private parent: RSField<D> | null;
  private form: RSForm<D>;
  private waiting: RSFieldWaiting | null = null;
  private disposers: (() => void)[] = [];

  fields: Record<string, RSField<D>> | null = null;
  errors: ValidateError[] = [];
  validating = false;
  touched = false;
  dirty = false;

  validate$: Subject<any> = new Subject();

  get fieldErrors(): ValidateError[] {
    const fields = this.fields || {};
    let errs: ValidateError[] = [];
    Object.keys(fields).forEach((key) => {
      const { errors, fieldErrors } = fields[key];
      errs = [...errs, ...errors, ...fieldErrors];
    });
    return errs;
  }

  get needValidate() {
    return (
      this.form.canValidate &&
      ((this.form.options.validateOnFieldTouched &&
        this.touched &&
        !this.waiting) ||
        this.dirty)
    );
  }

  constructor(schema: FieldSchema<D>, options: RSFieldOptions<D>) {
    const { ruleValue, rules = [], reducer = (data) => data } = schema;
    const { namePath, form, parent } = options;

    this.ruleValue = ruleValue;
    this.rules = rules;
    this.reducer = reducer;
    this.namePath = namePath;
    this.form = form;
    this.parent = parent || null;

    this.setSchema(schema);

    // validate
    const subscription = this.validate$
      .pipe(
        tap(() => {
          this.validating = true;
          this.dirty = false;
          // waiting
          const waiting: RSFieldWaiting = {} as RSFieldWaiting;
          waiting.promise = new Promise((resolve) => {
            waiting.resolve = resolve;
          });
          this.waiting = waiting;
          this.form.onChangeStatus();
        }),
        switchMap(() => {
          return this.validateAll();
        }),
        tap((errors) => {
          this.validating = false;
          this.errors = [...errors];
          this.waiting?.resolve(errors);
          this.form.onChangeStatus();
        }),
        catchError((error, caught) => {
          return caught;
        })
      )
      .subscribe();
    this.disposers.push(() => {
      subscription.unsubscribe();
    });

    // 如果表单验证过，则字段初始化时候就验证
    if (this.form.touched) {
      this.validate$.next();
    }
  }

  setTouch() {
    if (this.touched) return;
    this.touched = true;
    this.upTouch();
    this.downTouch();
    origin && this.form.onChangeStatus();
  }

  upTouch() {
    this.touched = true;
    this.parent?.upTouch();
  }

  downTouch() {
    this.touched = true;
    if (this.fields) {
      Object.keys(this.fields).forEach((key) => {
        (this.fields as Record<string, RSField<D>>)[key].downTouch();
      });
    }
  }

  onChange(value: any) {
    // touched
    this.setTouch();
    // dirty
    this.setDirty();
    // update form data
    console.log('===');
    this.form.onUpdate(this.reducer(this.form.data, value));
  }

  setDirty() {
    if (this.dirty) return;
    this.dirty = true;
    this.upDirty();
    this.downDirty();
  }

  upDirty() {
    this.dirty = true;
    this.parent?.upDirty();
  }

  downDirty() {
    this.dirty = true;
    if (this.fields) {
      Object.keys(this.fields).forEach((key) => {
        (this.fields as Record<string, RSField<D>>)[key].downDirty();
      });
    }
  }

  validate(fromFields = false) {
    if (!this.waiting || this.dirty) {
      if (fromFields) {
        this.validate$.next();
      } else {
        this.upValidate();
      }
    }
    return (this.waiting as RSFieldWaiting).promise;
  }

  upValidate() {
    this.validate$.next();
    this.parent?.upValidate();
  }

  checkValidate() {
    if (this.needValidate) {
      this.validate$.next();
    }
    if (this.fields) {
      Object.keys(this.fields).forEach((key) => {
        (this.fields as Record<string, RSField<D>>)[key].checkValidate();
      });
    }
  }

  forceValidate(fromFields = false) {
    if (fromFields) {
      this.validate$.next();
    } else {
      this.upValidate();
    }
    return (this.waiting as RSFieldWaiting).promise;
  }

  updateSchema(schema: FieldSchema<D>) {
    const { ruleValue, rules = [] } = schema;
    this.rules = rules;
    this.ruleValue = ruleValue;
    this.setSchema(schema);
  }

  dispose() {
    this.disposers.forEach((disposer) => {
      disposer();
    });
    this.disposers = [];
    if (this.fields) {
      Object.keys(this.fields).forEach((key) => {
        (this.fields as Record<string, RSField<D>>)[key].dispose();
      });
    }
  }

  private setSchema(schema: FieldSchema<D>) {
    const newFields: Record<string, FieldSchema<D> & { index: string }> = {};
    const fields = schema.fields;
    if (Array.isArray(fields)) {
      fields.forEach((item, index) => {
        if (!item.key) throw new Error('Array field need a key property!');
        newFields[item.key] = { ...item, index: `${index}` };
      });
    } else if (typeof fields === 'object' && fields !== null) {
      Object.keys(fields).forEach((key) => {
        newFields[key] = {
          ...fields[key],
          key,
          index: key
        };
      });
    }

    const oldKeys = Object.keys(this.fields || {});
    const newKeys = Object.keys(newFields);

    if (this.fields) {
      const fields = this.fields;
      oldKeys.forEach((key) => {
        if (newKeys.indexOf(key) === -1) {
          fields[key].dispose();
          delete fields[key];
        }
      });
    }

    if (newKeys.length) {
      if (!this.fields) this.fields = {};
    } else {
      this.fields = null;
    }

    if (this.fields) {
      const fields = this.fields;
      newKeys.forEach((key) => {
        if (oldKeys.indexOf(key) === -1) {
          fields[key] = new RSField<D>(newFields[key], {
            parent: this,
            form: this.form,
            namePath: this.namePath
              ? `${this.namePath}.${newFields[key].index}`
              : newFields[key].index,
            index: newFields[key].index
          });
        } else {
          fields[key].updateSchema(newFields[key]);
        }
      });
    }
  }

  private validateRules() {
    const { ruleValue, rules, form } = this;
    if (!rules.length) return EMPTY;
    // firstRuleError
    const firstRuleError = form.options.firstRuleError;
    let hasError = false;
    return of(...rules).pipe(
      concatMap((rule) => {
        return of('').pipe(
          switchMap(() => {
            if (hasError && firstRuleError) return EMPTY;
            return this.validateRule(rule, ruleValue, form.data);
          }),
          tap((errors) => {
            if (errors.length) hasError = true;
          })
        );
      }),
      reduce<string[]>((prev, cur) => prev.concat(...cur), []),
      map((errors) => {
        return errors.map((err) => {
          return new ValidateError(err, this.namePath);
        });
      })
    );
  }

  private validateRule(rule: FieldRule, value: any, source: RSFormData) {
    const errors: string[] = [];
    const ruleKeys = [
      'required',
      'type',
      'range',
      'pattern',
      'enum',
      'notWhitespace'
    ];
    ruleKeys.forEach((key) => {
      const ruleFunc = builtinRules[key as keyof typeof builtinRules];
      const customMessage = (rule.messages || {})[key];
      let errs = ruleFunc(rule, value, source, {
        messages,
        fullField: this.namePath
      });
      if (errs.length && customMessage) {
        errs = [customMessage];
      }
      errors.push(...errs);
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

    return of(errors.length && rule.message ? [rule.message] : errors);
  }

  private validateFields() {
    const fields = this.fields || {};
    const keys = Object.keys(fields);
    const arr = keys.map((key) => {
      return from(fields[key].validate(true));
    });
    return zip(...arr).pipe(
      map((arr) => {
        return arr.reduce((prev, cur) => [...prev, ...cur], []);
      })
    );
  }

  private validateAll(): Observable<ValidateError[]> {
    return concat(this.validateRules(), this.validateFields()).pipe(
      reduce<ValidateError[]>((prev, cur) => prev.concat(...cur), [])
    );
  }
}
