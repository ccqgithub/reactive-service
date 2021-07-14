import {
  from,
  Subject,
  BehaviorSubject,
  Subscription,
  EMPTY,
  of,
  Observable
} from 'rxjs';
import {
  catchError,
  switchMap,
  tap,
  concatMap,
  map,
  reduce
} from 'rxjs/operators';
import messages from './messages';
import builtinRules from './rule';
import ValidateError from './error';
import { FieldRule } from './types';

type FieldState<T> = {
  value: T;
  valid: boolean;
  dirty: boolean;
  touched: boolean;
  validating: boolean;
  errors: Error[];
};

type FieldResolve<T> = (state: FieldState<T>) => void;

type setValueOptions = {
  shouldDirty?: boolean;
};

class Field<T> {
  name: string;
  $state: BehaviorSubject<FieldState<T>>;
  private firstRuleError: boolean;
  private waitings: FieldResolve<T>[] = [];
  private lastValidate?: T;
  private $validate: Subject<void> = new Subject();
  private rules: any[] = [];
  private sub: Subscription | null = null;

  constructor(args: {
    rules: any[];
    defaultValue: T;
    firstRuleError: boolean;
    name: string;
  }) {
    const {
      rules = [],
      defaultValue,
      firstRuleError = true,
      name = 'anonymous'
    } = args;

    this.name = name;
    this.rules = rules;
    this.firstRuleError = firstRuleError;
    this.$state = new BehaviorSubject<FieldState<T>>({
      value: defaultValue,
      valid: true,
      dirty: false,
      touched: false,
      validating: false,
      errors: []
    });

    this.resetSubscribe();
  }

  get state() {
    return this.$state.value;
  }

  private resetSubscribe() {
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.$validate
      .pipe(
        tap(() => {
          this.lastValidate = this.state.value;
          this.updateState({ validating: true });
        }),
        switchMap(() => {
          return from(this.validateRules());
        }),
        tap((errs) => {
          this.updateState({
            validating: false,
            errors: errs,
            valid: !errs.length
          });
          this.waitings.forEach((resolve) => {
            resolve(this.state);
          });
          this.waitings = [];
        }),
        catchError((err, caught) => {
          console.error && console.error(err);
          return caught;
        })
      )
      .subscribe();
  }

  private updateState(s: Partial<FieldState<T>>) {
    this.$state.next({
      ...this.$state.value,
      ...s
    });
  }

  private validateRules() {
    const { rules, state, firstRuleError } = this;
    if (!rules.length) return EMPTY;
    let hasError = false;

    return of(...rules).pipe(
      concatMap((rule) => {
        return of('').pipe(
          switchMap(() => {
            if (hasError && firstRuleError) return EMPTY;
            return this.validateRule(rule, state.value);
          }),
          tap((errors) => {
            if (errors.length) hasError = true;
          })
        );
      }),
      reduce<string[]>((prev, cur) => prev.concat(...cur), []),
      map((errors) => {
        return errors.map((err) => {
          return new ValidateError(err, this.name);
        });
      })
    );
  }

  private validateRule(rule: FieldRule, value: any) {
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
      let errs = ruleFunc(rule, value, {
        messages,
        name: this.name
      });
      if (errs.length && customMessage) {
        errs = [customMessage];
      }
      errors.push(...errs);
    });

    let $v: Observable<string[]> | null = null;

    if (rule.validator) {
      const res = rule.validator(rule, value, {
        messages,
        name: this.name
      });
      if (res instanceof Observable) {
        $v = res;
      } else if (res instanceof Promise) {
        $v = from(res);
      } else {
        $v = of(res);
      }
    }

    if ($v) {
      return $v.pipe(
        map((errs) => {
          return errors.concat(...errs);
        })
      );
    }

    return of(errors.length && rule.message ? [rule.message] : errors);
  }

  setTouched() {
    this.updateState({
      touched: true
    });
  }

  setValue(v: T, args: setValueOptions = {}) {
    const { value, dirty } = this.state;
    const { shouldDirty = value !== v } = args;

    this.updateState({
      value: value,
      dirty: shouldDirty || dirty
    });

    this.validate();
  }

  reset(args: { defaultValue: T }) {
    this.$state.next({
      value: args.defaultValue,
      valid: true,
      dirty: false,
      touched: false,
      validating: false,
      errors: []
    });
    this.resetSubscribe();
  }

  validate() {
    const needValidate = this.lastValidate !== this.state.value;

    if (needValidate) this.$validate.next();

    const promise = new Promise<FieldState<T>>((resolve) => {
      if (this.state.validating) {
        this.waitings.push(resolve);
      } else {
        resolve(this.state);
      }
    });

    return promise;
  }
}

export default Field;
