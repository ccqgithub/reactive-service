import { from, Subject, BehaviorSubject, Subscription, of } from 'rxjs';
import {
  catchError,
  switchMap,
  tap,
  concatMap,
  map,
  reduce
} from 'rxjs/operators';
import Disposable from './disposable';
import messages from './util/messages';
import builtinRules from './rule';
import ValidateError from './error';
import { FieldRule } from './types';

export type FieldState<T> = {
  // 默认值
  defaultValue: T;
  // 字段的值
  value: T;
  // 字段验证通过状态
  valid: boolean;
  // 字段值被改变过
  dirty: boolean;
  // 字段是否被操作过
  touched: boolean;
  // 字段是否正在验证
  validating: boolean;
  // 字段的错误
  errors: ValidateError[];
};

export type FieldResolve<T> = (state: FieldState<T>) => void;

class Field<T> extends Disposable {
  // 字段名称，在查看调试信息时很有用
  name: string;
  // 字段的状态
  state$: BehaviorSubject<FieldState<T>>;
  // 为True时，如果第一个规则验证失败，则不再验证其他规则
  private first: boolean;
  // 字段的验证规则
  private rules: any[] = [];
  // 等到验证结果的回调
  private waitings: FieldResolve<T>[] = [];
  // 上一次验证的值，用来防止重复验证同一个值，提升效率
  private lastValidate?: T;
  // 验证流
  private validate$: Subject<void> = new Subject();
  // 验证流的订阅
  private sub: Subscription | null = null;

  constructor(args: {
    name: string;
    defaultValue: T;
    rules?: any[];
    first?: boolean;
  }) {
    super();

    const { name = 'Field', defaultValue, rules = [], first = true } = args;

    this.name = name;
    this.rules = rules;
    this.first = first;
    this.state$ = new BehaviorSubject<FieldState<T>>({
      defaultValue,
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
    return this.state$.value;
  }

  private resetSubscribe() {
    if (this.sub) this.sub.unsubscribe();
    this.updateState({ validating: false });
    this.lastValidate = undefined;
    this.sub = this.validate$
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

    this.beforeDispose(() => {
      this.sub && this.sub.unsubscribe();
    });
  }

  private updateState(s: Partial<FieldState<T>>) {
    this.state$.next({
      ...this.state,
      ...s
    });
  }

  private validateRules() {
    const { rules, state, first } = this;
    if (!rules.length) return of([]);
    let hasError = false;

    return of(...rules).pipe(
      concatMap((rule) => {
        return of('').pipe(
          switchMap(() => {
            if (hasError && first) return of([]);
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
    const validateMessages = {
      ...messages,
      ...(rule.messages || {})
    };
    const customMessage = rule.message;
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
      const errs = ruleFunc(rule, value, {
        messages: validateMessages,
        name: this.name
      });
      errors.push(...errs);
    });

    return of(errors).pipe(
      switchMap((errors) => {
        if (!rule.validator) return of(errors);
        const res = rule.validator(rule, value, {
          messages: validateMessages,
          name: this.name
        });
        return from(res).pipe(
          map((errs) => {
            return [...errors, ...errs];
          })
        );
      }),
      map((errs) => {
        return customMessage && errs.length ? [customMessage] : errs;
      })
    );
  }

  setTouched() {
    this.updateState({
      touched: true
    });
  }

  setValue(
    v: T,
    args: {
      shouldDirty?: boolean;
    } = {}
  ) {
    const { value, dirty } = this.state;
    const { shouldDirty = value !== v } = args;

    this.updateState({
      value: value,
      dirty: shouldDirty || dirty
    });

    this.validate();
  }

  reset(args: { defaultValue: T }) {
    this.state$.next({
      defaultValue: args.defaultValue,
      value: args.defaultValue,
      valid: true,
      dirty: false,
      touched: false,
      validating: false,
      errors: []
    });
    this.resetSubscribe();
  }

  validate(force = false) {
    const needValidate = this.lastValidate !== this.state.value;
    if (needValidate || force) this.validate$.next();

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
