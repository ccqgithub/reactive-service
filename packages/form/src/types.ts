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

export type KeyPaths<Schema extends Record<string, any>> = {
  []
}