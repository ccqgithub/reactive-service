import { BehaviorSubject, from, Subject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import RSField from './field';
import ValidateError from './error';
import { RSFormData, FormSchema } from './types';

export type RSFormWaiting = {
  promise: Promise<ValidateError[]>;
  resolve: (errors: ValidateError[]) => void;
};

export default class RSForm<D extends RSFormData = RSFormData> {
  private schema: FormSchema<D>;
  private disposers: (() => void)[] = [];

  private form: RSField;
  private waiting: RSFormWaiting | null = null;
  dirty = false;

  data$$: BehaviorSubject<D>;
  validating$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errors$$: BehaviorSubject<ValidateError[]> = new BehaviorSubject<
    ValidateError[]
  >([]);

  validate$: Subject<any> = new Subject<any>();

  get data() {
    return this.data$$.value;
  }

  get validating() {
    return this.validating$$.value;
  }

  get errors() {
    return this.errors$$.value;
  }

  get fields() {
    return this.form.fields;
  }

  constructor(schema: FormSchema<D>, data: D) {
    this.schema = schema;

    this.data$$ = new BehaviorSubject(data);
    this.form = new RSField(this.getFormFieldSchema(), data, {
      form: this as RSForm,
      name: '',
      namePath: '',
      index: ''
    });

    const validate$ = this.validate$.pipe(
      tap(() => {
        this.dirty = true;
        this.validating$$.next(true);
        // waiting
        const waiting: RSFormWaiting = {} as RSFormWaiting;
        waiting.promise = new Promise((resolve) => {
          waiting.resolve = resolve;
        });
        this.waiting = waiting;
      }),
      switchMap(() => {
        const promise = this.form.validate();
        return from(promise);
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
    );
    const subscription = validate$.subscribe();
    this.disposers.push(() => {
      subscription.unsubscribe();
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

  updateErrors() {
    this.errors$$.next(this.form.errors);
    this.fields$$.next(this.form.fieldErrors);
  }

  update(data: Partial<D>) {
    this.data$$.next({
      ...this.data,
      ...data
    });

    this.form.update(this.getFormFieldSchema(), this.data);
  }

  validate() {
    if (!this.validating) this.validate$.next();
    return (this.waiting as RSFormWaiting).promise;
  }

  dispose() {
    this.disposers.forEach((disposer) => {
      disposer();
    });
  }
}
