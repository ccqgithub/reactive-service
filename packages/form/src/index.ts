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
  Schema,
  FieldSchema,
  ArrayFieldSchema,
  FieldInitSchema,
  Value,
  Data,
  Rules,
  DynamicRules,
  Fields,
  DynamicFields,
  ArrayFields,
  ValidateStatus,
  Validator,
  FieldErrors,
  RuleError
} from './types';

export type RSFieldWaiting = {
  promise: Promise<any>;
  resolve: (value?: any) => void;
};

export type RSFieldChildren = {
  [fieldName: string]: RSField;
};

class RSField {
  name: string;
  rules: Rules | DynamicRules = [];
  fields: Fields | DynamicFields | ArrayFields | null = null;
  shouldValidate = (value: Value, oldValue: Value) => value !== oldValue;

  children: RSFieldChildren = {};

  value$$: BehaviorSubject<Value>;
  status$$: BehaviorSubject<ValidateStatus> = new BehaviorSubject<
    ValidateStatus
  >({
    validating: false,
    errors: [],
    fieldErrors: {}
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

  constructor(args: FieldInitSchema, value: Value, form: RSForm) {
    const { name, rules, fields = null } = args;
    this.name = name;
    this.rules = rules;
    this.fields = fields;
    this.value$$ = new BehaviorSubject(value);
    this.form = form;

    // fields
    if (fields) {
      const schemas = this.buildChildrenSchemas();
      Object.keys(schemas).forEach((key) => {
        this.children[key] = new RSField(schemas[key], value[key], this.form);
      });
    }

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

  buildChildrenSchemas(): Record<string, FieldInitSchema> {
    const { fields, value, form } = this;
    if (!fields || typeof value !== 'object') return {};

    const schemas =
      typeof fields === 'function' ? fields(value, form.state) : { ...fields };

    if (Array.isArray(schemas)) {
      const result = {} as Record<string, FieldInitSchema>;
      schemas.forEach((item, index) => {
        if (!item.name) throw new Error(`Array field need a key!`);
        result[index] = item;
      });
      return result;
    }

    if (typeof schemas === 'object') {
      const result = {} as Record<string, FieldInitSchema>;
      Object.keys(schemas).forEach((key) => {
        result[key] = {
          ...schemas[key],
          name: key
        };
      });
      return result;
    }

    throw new Error(`Error fields!`);
  }

  updateFields() {
    const { children, value } = this;
    const newSchemas = this.buildChildrenSchemas() || {};
    const oldKeys = Object.keys(this.children);
    const newKeys = Object.keys(newSchemas);

    oldKeys.forEach((key) => {
      if (newKeys.indexOf(key) === -1) {
        children[key].dispose();
        delete children[key];
      }
    });

    newKeys.forEach((key) => {
      if (oldKeys.indexOf(key) === -1) {
        children[key] = new RSField(newSchemas[key], value[key], this.form);
      } else {
        children[key].update(value[key]);
      }
    });
  }

  update(value: Value) {
    const shouldValidate = this.shouldValidate(value, this.value);
    this.value$$.next(value);
    this.updateFields();
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
  errors: string[];
  fieldErrors: FieldErrors;
};

class RSForm {
  form;
  dirty = false;

  subscription: Subscription | null = null;

  status$$: BehaviorSubject<RSFormStatus> = new BehaviorSubject<RSFormStatus>({
    validating: false,
    errors: [],
    fieldErrors: {}
  });
  validate$: Subject<any> = new Subject<any>();

  constructor(descriptor: Schema, data: Data) {
    this.form = new RSField(descriptor, data, this);

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

  get state() {
    return this.state$$.value;
  }

  updateData(data) {
    this.state$$.next({
      ...this.state,
      ...data
    });
    this.form.updateData(data, data, this);
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
