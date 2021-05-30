import { Observable } from 'rxjs';
import ValidateError from './error';

export type RSFormData = Record<string, any>;

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

export type FieldType = {
  value?: any;
  fields?: Record<string, FieldType>;
};

export type FieldSchema<D extends RSFormData = RSFormData> = {
  key?: string;
  ruleValue: any;
  rules: FieldRule[];
  fields?: FieldSchema<D>[] | Record<string, FieldSchema<D>>;
  reducer?: (data: D, value: any) => D;
};

export type BuildFormSchema<D extends RSFormData> = (
  data: D
) => Record<string, FieldSchema<D>>;

export type FieldErrors = Record<
  string,
  {
    errors: ValidateError[];
    fields: FieldErrors;
  }
>;

export type Validator = (
  rule: FieldRule,
  value: any,
  source: RSFormData,
  Options: Record<string, any>
) => string[] | Promise<string[]> | Observable<string[]>;
