import {
  BehaviorSubject,
  concat,
  from,
  Observable,
  of,
  Subject,
  zip
} from 'rxjs';
import { catchError, concatAll, reduce, switchMap, tap } from 'rxjs/operators';
import validators from './validator';
import {
  FieldValue,
  FormData,
  FieldRule,
  FieldSchema,
  FormSchema,
  Validator
} from './types';

export type RSFieldWaiting = {
  promise: Promise<string[]>;
  resolve: (errors: string[]) => void;
};

export type RSFieldChildren = {
  [fieldName: string]: RSField;
};

export type RSFieldOptions = {
  form: RSForm;
  name: string;
  namePath: string;
  index: string | number;
};

class RSField {
  index: number | string;
  name: string;
  namePath: string;
  rules: FieldRule[];
  shouldValidate = (value: FieldValue, oldValue: FieldValue) =>
    value !== oldValue;

  fields: RSFieldChildren = {};

  dirty$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  validating$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errors$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  value$$: BehaviorSubject<FieldValue>;

  validate$: Subject<any> = new Subject();

  form: RSForm;
  waiting: RSFieldWaiting | null = null;
  disposers: (() => void)[] = [];

  get value() {
    return this.value$$.value;
  }

  get dirty() {
    return this.dirty$$.value;
  }

  get errors() {
    return this.errors$$.value;
  }

  get validating() {
    return this.validating$$.value;
  }

  constructor(schema: FieldSchema, value: FieldValue, options: RSFieldOptions) {
    const { rules = [] } = schema;
    const { name, namePath, form, index } = options;

    if (!name) throw new Error('Need a name for RSField!');

    this.rules = rules;
    this.name = name;
    this.namePath = namePath;
    this.index = index;
    this.form = form;
    this.value$$ = new BehaviorSubject(value);

    this.updateFields(schema, value);

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
  }

  updateFields(schema: FieldSchema, value: FieldValue) {
    const newFields: Record<
      string,
      FieldSchema & { index: string | number }
    > = {};
    if (Array.isArray(schema.fields)) {
      schema.fields.forEach((item, index) => {
        if (!item.name) throw new Error('Array field need a name property!');
        newFields[item.name] = { ...item, index };
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
            namePath: `${this.name}.${key}`,
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

  validateRules() {
    const { value, rules, form } = this;

    const obArr: Observable<string[]>[] = [];
    rules.forEach((rule) => {
      let validator: Validator | null = rule.validator || null;
      if (!validator) {
        const type = rule.type || 'any';
        validator = validators[type as keyof typeof validators];
      }

      if (!validator) return;

      const res = validator(rule, value, form.data, {
        field: this.name,
        fullField: this.namePath
      });

      if (res instanceof Observable) {
        obArr.push(res);
      } else if (res instanceof Promise) {
        return obArr.push(from(res));
      } else {
        return of(res);
      }
    });

    return of(...obArr).pipe(
      concatAll(),
      reduce<string[]>((prev, cur) => prev.concat(...cur), [])
    );
  }

  validateFields() {
    const { fields } = this;
    const keys = Object.keys(fields);
    const arr = keys.map((key) => {
      return fields[key].validateAll();
    });
    return zip(...arr);
  }

  validateAll(): Observable<string[]> {
    return concat(this.validateRules, this.validateFields);
  }

  validate() {
    if (!this.waiting) this.validate$.next();
    return from((this.waiting as RSFieldWaiting).promise);
  }

  getSubValue(value: any, key: string | number) {
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

class RSForm {
  schema: FormSchema;
  disposers: (() => void)[] = [];

  form: RSField;

  dirty$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  validating$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errors$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  data$$: BehaviorSubject<FormData>;

  validate$: Subject<any> = new Subject<any>();

  get dirty() {
    return this.dirty$$.value;
  }

  get validating() {
    return this.validating$$.value;
  }

  get errors() {
    return this.errors$$.value;
  }

  get data() {
    return this.data$$.value;
  }

  constructor(schema: FormSchema, data: FormData) {
    this.schema = schema;

    this.data$$ = new BehaviorSubject(data);
    this.form = new RSField(this.getSchema(), data, {
      form: this,
      name: 'form',
      namePath: 'form',
      index: 'form'
    });

    const validate$ = this.validate$.pipe(
      tap(() => {
        !this.dirty && this.dirty$$.next(true);
        this.validating$$.next(true);
      }),
      switchMap(() => {
        const ob$ = this.form.validate();
        return ob$;
      }),
      tap((errors) => {
        this.validating$$.next(false);
        this.errors$$.next(errors);
      }),
      catchError((error, caught) => {
        console.log(error);
        return caught;
      })
    );
    const subscription = validate$.subscribe();
    this.disposers.push(() => {
      subscription.unsubscribe();
    });
  }

  getSchema() {
    const { schema } = this;
    const fields = typeof schema === 'function' ? schema(this.data) : schema;
    return {
      rules: [],
      fields
    };
  }

  update(data: FormData) {
    this.data$$.next({
      ...this.data,
      ...data
    });

    this.form.update(this.getSchema(), this.data);
  }

  validate() {
    this.validate$.next();
  }

  dispose() {
    this.disposers.forEach((disposer) => {
      disposer();
    });
  }
}
