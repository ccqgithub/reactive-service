import {
  BehaviorSubject,
  from,
  Observable,
  of,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import validators from './validator';
import {
  Schema,
  Value,
  Data,
  Rules,
  DynamicRules,
  Fields,
  DynamicFields,
  ArrayFields,
  ValidateStatus,
  Validator,
  FieldErrors
} from './types';

export type RSFieldWaiting = {
  promise: Promise<any>;
  resolve: (value?: any) => void;
};

export type RSFieldChildren = {
  [fieldName: string]: RSField;
};

class RSField {
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
  validate$ = new Subject();

  form: RSForm;
  waiting: RSFieldWaiting | null = null;
  disposers: (() => void)[] = [];

  get value() {
    return this.value$$.value;
  }

  get status() {
    return this.status$$.value;
  }

  constructor(args: Schema, value: Value, form: RSForm) {
    const { rules, fields = null } = args;
    this.rules = rules;
    this.fields = fields;
    this.value$$ = new BehaviorSubject(value);
    this.form = form;

    // fields
    if (this.fields) {
      const schemas = this.buildSchemas();
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

  buildSchemas(): Fields {
    const { fields, value, form } = this;
    if (!fields) return {};

    const result = {} as Fields;
    const schemas =
      typeof fields === 'function' ? fields(value, form.state) : { ...fields };

    if (Array.isArray(schemas)) {
      schemas.forEach((item) => {
        if (!item.key) throw new Error(`Array field need a key!`);
        result[item.key] = item;
      });
      return result;
    }

    if (typeof schemas === 'object') {
      Object.keys(schemas).forEach((key) => {
        result[key] = schemas[key];
      });
      return result;
    }

    throw new Error(`Errir fields!`);
  }

  updateFields() {
    const { children, value } = this;
    const newSchemas = this.buildSchemas() || {};
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

    let ob$ = of<any>([]);
    rules.forEach((rule) => {
      let validator: Validator = rule.validator;
      if (!validator) {
        const type = rule.type || 'any';
        validator = (validators as any)[type];
      }

      if (!validator) return;

      let res: any;
      const v$ = new Observable((observer) => {
        res = rule.validator(
          rule,
          value,
          (errors: string[]) => {
            observer.next(errors);
            observer.complete();
          },
          this.form.state,
          {}
        );
      });
      if (res instanceof Observable || res instanceof Promise) {
        ob$ = ob$.pipe(switchMap(() => from(res)));
      } else {
        ob$ = ob$.pipe(switchMap(() => v$));
      }
    });

    return ob$;
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
      }),
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
