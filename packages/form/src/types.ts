import { ValidateError } from './error';

export type Value = any;
export type Data = Record<string, any>;

export type Rule = Record<string, any>;
export type Rules = Rule[];
export type DynamicRules = (value: Value, source: Data) => Rules;

export type Fields = {
  [fieldName: string]: FieldSchema;
};
export type ArrayFields = ArrayFieldSchema[];
export type DynamicFields = (
  value: Value,
  source: Data
) => Fields | ArrayFields;

export type FieldSchema = {
  rules: Rules | DynamicRules;
  fields?: Fields | ArrayFields | DynamicFields;
};
export type ArrayFieldSchema = {
  name: string;
  rules: Rules | DynamicRules;
  fields?: Fields | ArrayFields | DynamicFields;
};
export type FieldInitSchema = {
  name: string;
  rules: Rules | DynamicRules;
  fields?: Fields | ArrayFields | DynamicFields;
};

export type RuleError = string | Error;
export type FieldErrors = {
  [field: string]: {
    errors: ValidateError[];
    fieldErrors: FieldErrors;
  };
};
export type ValidateStatus = {
  validating: boolean;
  errors: ValidateError[];
  fieldErrors: FieldErrors;
};

export type Validator = (
  rule: Rule,
  value: Value,
  callback: (errors: string[]) => void,
  source: Data,
  Options: Record<string, any>
) => void;
