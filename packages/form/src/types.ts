export type Value = any;
export type Data = Record<string, any>;

export type Rule = Record<string, any>;

export type Rules = Rule[];

export type DynamicRules = (value: Value, source: Data) => Rules;

export type Fields = {
  [fieldName: string]: Schema;
};

export type ArrayFields = Schema[];

export type DynamicFields = (
  value: Value,
  source: Data
) => Fields | ArrayFields;

export type Schema = {
  key?: string;
  rules: Rules | DynamicRules;
  fields?: Fields | ArrayFields | DynamicFields;
};

export type ValidateStatus = {
  validating: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
};

export type Validator = (
  rule: Rule,
  value: Value,
  callback: (errors: string[]) => void,
  source: Data,
  Options: Record<string, any>
) => void;

export type FieldErrors = {
  [field: string]: {
    errors: string[];
    fieldErrors: FieldErrors;
  };
};
