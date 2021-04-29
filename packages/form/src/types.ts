import { Observable } from 'rxjs';
import ValidateError from './error';

export type RSFormData = Record<string, any>;

export type RSRule = {
  type?: string;
  required?: boolean;
  len?: number;
  min?: number;
  max: number;
  pattern?: RegExp;
  enum?: string[];
  notWhitespace?: boolean;
  validator?: Validator;
  message?: string;
};
export type RSRuleValue = any;

export type SchemaField<D extends RSFormData = RSFormData> = {
  key?: string;
  ruleValue: RSRuleValue;
  rules: RSRule[];
  fields?: SchemaField[] | Record<string, SchemaField>;
  reducer: () => void;
};

export type Schema = Record<string, SchemaField>;
export type BuildSchema<
  S extends Schema = Schema,
  D extends RSFormData = RSFormData
> = (data: D) => S;

export type FieldErrors = Record<
  string,
  {
    errors: ValidateError[];
    fields: FieldErrors;
  }
>;

export type Validator = (
  rule: FieldRule,
  value: FieldValue,
  source: RSFormData,
  Options: Record<string, any>
) => string[] | Promise<string[]> | Observable<string[]>;
