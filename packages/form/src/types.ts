import { Observable } from 'rxjs';

export type FieldValue = any;
export type FormData = Record<string, any>;

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
};

export type FieldSchema = {
  name?: string;
  rules: FieldRule[];
  fields?: FieldSchema[] | Record<string, FieldSchema>;
};

export type FormSchema =
  | Record<string, FieldSchema>
  | ((data: FormData) => Record<string, FieldSchema>);

export type FieldErrors = {
  errors: string[];
  fields: Record<string, FieldErrors>;
};

export type Validator = (
  rule: FieldRule,
  value: FieldValue,
  source: FormData,
  Options: Record<string, any>
) => string[] | Promise<string[]> | Observable<string[]>;
