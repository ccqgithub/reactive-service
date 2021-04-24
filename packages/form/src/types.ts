import { Observable } from 'rxjs';
import ValidateError from './error';

export type FieldValue = any;
export type RSFormData = Record<string, any>;

export type FieldRule = {
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

export type FieldSchema = {
  name?: string;
  rules: FieldRule[];
  fields?: FieldSchema[] | Record<string, FieldSchema>;
};

export type FormSchema = Record<string, FieldSchema>;
export type BuildFormSchema<S extends FormSchema> = (data: RSFormData) => S;

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
