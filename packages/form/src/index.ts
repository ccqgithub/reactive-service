import {
  BehaviorSubject,
  concat,
  from,
  Observable,
  of,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  concatAll,
  concatMap,
  reduce,
  switchMap,
  tap,
  map
} from 'rxjs/operators';
import validators from './validator';
import { ValidateError } from './error';
import {
  FieldValue,
  FormData,
  FieldRule,
  FieldSchema,
  FormSchema,
  FieldErrors,
  ValidateStatus,
  Validator
} from './types';

export type RSFieldWaiting = {
  promise: Promise<ValidateError[]>;
  resolve: (errors: ValidateError[]) => void;
};

export type RSFieldChildren = {
  [fieldName: string]: RSField;
};

class RSField {
  type: string;
  name: string;
  rules: FieldRule[];
  shouldValidate = (value: FieldValue, oldValue: FieldValue) =>
    value !== oldValue;

  fields: RSFieldChildren = {};

  value$$: BehaviorSubject<FieldValue>;
  status$$: BehaviorSubject<ValidateStatus> = new BehaviorSubject<
    ValidateStatus
  >({
    validating: false,
    errors: [],
    fields: {}
  });
  validate$: Subject<any> = new Subject();

  form: RSForm;
  waiting: RSFieldWaiting | null = null;
  disposers: (() => void)[] = [];

  get value() {
    return this.value$$.value;
  }

  get status() {
    return this.status$$.value;
  }

  constructor(schema: FieldSchema, value: FieldValue, form: RSForm) {
    const { type, name, rules } = schema;

    if (!name) throw new Error('Need a name for RSField!');

    this.type = type;
    this.name = name;
    this.rules = rules;
    this.form = form;
    this.value$$ = new BehaviorSubject(value);

    this.updateFields(schema, value);

    const subscription = this.validate$
      .pipe(
        tap(() => {
          this.status$$.next({
            ...this.status$$.value,
            validating: true
          });
          // waiting
          const waiting: RSFieldWaiting = {} as RSFieldWaiting;
          waiting.promise = new Promise((resolve) => {
            waiting.resolve = resolve;
          });
          this.waiting = waiting;
        }),
        switchMap(() => {
          return this.validateRules();
        }),
        tap((errors) => {
          this.status$$.next({
            ...this.status$$.value,
            validating: false,
            errors
          });
          this.waiting && this.waiting.resolve();
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
    const newFields: Record<string, FieldSchema> = {};
    if (Array.isArray(schema.fields)) {
      schema.fields.forEach((item) => {
        if (!item.name) throw new Error('Array field need a name property!');
        newFields[item.name] = item;
      });
    } else if (typeof schema.fields === 'object') {
      Object.keys(schema.fields).forEach((key) => {
        newFields[key] = {
          ...(schema.fields as Record<string, FieldSchema>)[key],
          name: key
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
        this.fields[key] = new RSField(newFields[key], value[key], this.form);
      } else {
        this.fields[key].update(newFields[key], value[key]);
      }
    });
  }

  update(schema: FieldSchema, value: FieldValue) {
    const shouldValidate = this.shouldValidate(value, this.value);
    this.value$$.next(value);
    this.updateFields(schema, value);
    shouldValidate && this.validate();
  }

  validateRules() {
    const { value, form } = this;
    const rules =
      typeof this.rules === 'function'
        ? this.rules(value, form.state)
        : this.rules;

    const obArr: Observable<RuleError[]>[] = [];
    rules.forEach((rule) => {
      let validator: Validator = rule.validator;
      if (!validator) {
        const type = rule.type || 'any';
        validator = (validators as any)[type];
      }

      if (!validator) return;

      let res: any;
      const v$ = new Observable<RuleError[]>((observer) => {
        res = rule.validator(
          rule,
          value,
          (errors: RuleError[]) => {
            observer.next(errors);
            observer.complete();
          },
          this.form.state,
          {}
        );
      });
      if (res instanceof Observable) {
        obArr.push(res);
      } else if (res instanceof Promise) {
        return obArr.push(from(res));
      } else {
        return obArr.push(v$);
      }
    });

    return of(...obArr).pipe(
      concatAll(),
      reduce<RuleError[]>((prev, cur) => prev.concat(...cur), []),
      map((errors) => {
        return errors.map((error) => {
          return typeof error === 'string'
            ? new ValidateError(error, this.name)
            : new ValidateError(error.message, this.name);
        });
      })
    );
  }

  validate(): Observable<string[]> {
    this.validate$.next();
    return from((this.waiting as RSFieldWaiting).promise);
  }

  dispose() {
    this.disposers.forEach((disposer) => {
      disposer();
    });
    this.disposers = [];
  }
}

export type RSFormStatus = {
  validating: boolean;
  errors: ValidateError[];
  fieldErrors: Record<string, FieldErrors>;
};

class RSForm {
  schema: Record<string, FieldSchema>;
  fields: Record<string, RSField>;

  buildSchema: FormSchema | null = null;

  dirty = false;

  subscription: Subscription | null = null;

  data$$: BehaviorSubject<FormData>;
  status$$: BehaviorSubject<RSFormStatus> = new BehaviorSubject<RSFormStatus>({
    validating: false,
    errors: [],
    fieldErrors: {}
  });
  validate$: Subject<any> = new Subject<any>();

  constructor(schema: FormSchema, data: FormData) {
    if (typeof schema === 'function') {
      this.schema = schema(data);
      this.buildSchema = schema;
    } else {
      this.schema = schema;
    }

    this.data$$ = new BehaviorSubject(data);
    this.fields = {};
    Object.keys(this.schema).forEach((key) => {
      this.fields[key] = new RSField(this.schema[key], this.data[key], this);
    });

    const validate$ = this.validate$.pipe(
      tap(() => {
        this.dirty = true;
        this.status$$.next({
          ...this.status$$.value,
          validating: true
        });
      }),
      switchMap((v) => {
        const ob$ = this.form.validate();
        return ob$;
      }),
      tap((errors) => {
        this.status$$.next({
          ...this.status$$.value,
          validating: false,
          errors,
          fieldErrors
        });
      })
      // throwError((error, caught) => {
      //   console.log(error);
      //   return caught;
      // })
    );

    this.subscription = validate$.subscribe();
  }

  get status() {
    return this.status$$.value;
  }

  get data() {
    return this.data$$.value;
  }

  update(data: FormData) {
    this.data$$.next({
      ...this.data,
      ...data
    });

    // update fields
    const schema =
      typeof this.buildSchema === 'function'
        ? this.buildSchema(data)
        : this.schema;
    const oldSchema = this.schema;
    this.schema = schema;

    const newKeys = Object.keys(schema);
    const oldKeys = Object.keys(oldSchema);
    oldKeys.forEach((key) => {
      if (newKeys.indexOf(key) === -1) {
        this.fields[key].dispose();
        return;
      }
      this.fields[key].update(this.data[key], this.schema[key]);
    });
    newKeys.forEach((key) => {
      if (oldKeys.indexOf(key) !== -1) return;
      this.fields[key] = new RSField(this.schema[key], this.data[key], this);
    });
  }

  validate() {
    this.validate$.next();
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
