import { Observable } from 'rxjs';
import ValidateError from './error';

export type FieldRule = {
  type?: string;
  required?: boolean;
  len?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  notWhitespace?: boolean;
  validator?: Validator;
  message?: string;
  messages?: Record<string, string>;
};

export type Validator = (
  rule: FieldRule,
  value: any,
  options: Record<string, any>
) => string[] | Promise<string[]> | Observable<string[]>;

// 'a.b.c' => ['a', 'b', 'c']
type Split<T extends string> = T extends ''
  ? []
  : T extends `${infer A}.${infer B}`
  ? [A, ...Split<B>]
  : [T];
// get value of object by key path
// key path: 'a.b.[1].c'
type ArrayPathValue<Value, Path> = Path extends [infer Key, ...infer Rest]
  ? Key extends `[${infer Index}]`
    ? Index extends keyof Value
      ? ArrayPathValue<Value[Index], Rest>
      : Value extends (infer Nest)[]
      ? ArrayPathValue<Nest, Rest>
      : undefined
    : Key extends keyof Value
    ? ArrayPathValue<Value[Key], Rest>
    : undefined
  : Value;
type PathValue<Value, Path extends string> = ArrayPathValue<Value, Split<Path>>;
type Schema = {
  a: {
    b: { d: 3 }[];
  };
};
type Test = PathValue<Schema, 'a.b'>;
