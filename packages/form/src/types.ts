import { Observable } from 'rxjs';

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

// 'a.b[c].d[e][f].g' => 'a.b.c.d.e.f.g'
type ReplaceSquareBrackets<T extends string> =
  T extends `${infer Before}[${infer V}]${infer After}`
    ? ReplaceSquareBrackets<`${Before}.${V}${After}`>
    : T;

// 'a.b.c' => ['a', 'b', 'c']
type SplitPath<T extends string> = T extends ''
  ? []
  : T extends `${infer A}.${infer B}`
  ? [A, ...SplitPath<B>]
  : [T];

// get value of object by key path
// key path: 'a.b.1.c'
type ArrayPathValue<Value, Path> = Path extends [infer Key, ...infer Rest]
  ? Key extends keyof Value
    ? ArrayPathValue<Value[Key], Rest>
    : undefined
  : Value;

export type KeyPathValue<Value, Path extends string> = ArrayPathValue<
  Value,
  SplitPath<ReplaceSquareBrackets<Path>>
>;
