import { ValidateError } from './error';

export type FieldValue = any;
export type FormData = Record<string, any>;

export type FieldRule = {
  required?: boolean;
  len?: number;
  min?: number;
  max: number;
  pattern?: RegExp;
  enum?: any[];
  validator?: Validator;
};

export type FieldSchema = {
  type: string;
  name?: string;
  rules: FieldRule[];
  fields?: FieldSchema[] | Record<string, FieldSchema>;
};

export type FormSchema =
  | Record<string, FieldSchema>
  | ((data: FormData) => Record<string, FieldSchema>);

export type FieldErrors = {
  errors: ValidateError[];
  fields: Record<string, ValidateError>;
};

export type ValidateStatus = {
  validating: boolean;
  errors: ValidateError[];
  fields: Record<string, FieldErrors>;
};

export type Validator = (
  rule: FieldRule,
  value: FieldValue,
  callback: (errors: (string | Error)[]) => void,
  source: FormData,
  Options: Record<string, any>
) => void;
