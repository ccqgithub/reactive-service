import { Observable } from 'rxjs';
import ValidateError from './error';
export declare type RSFormData = Record<string, any>;
export declare type FieldRule = {
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
    messages?: Record<string, string>;
};
export declare type FieldType = {
    value?: any;
    fields?: Record<string, FieldType>;
};
export declare type FieldSchema<D extends RSFormData = RSFormData> = {
    key?: string;
    ruleValue: any;
    rules: FieldRule[];
    fields?: FieldSchema<D>[] | Record<string, FieldSchema<D>>;
    reducer?: (data: D, value: any) => D;
};
export declare type BuildFormSchema<D extends RSFormData> = (data: D) => Record<string, FieldSchema<D>>;
export declare type FieldErrors = Record<string, {
    errors: ValidateError[];
    fields: FieldErrors;
}>;
export declare type Validator = (rule: FieldRule, value: any, source: RSFormData, Options: Record<string, any>) => string[] | Promise<string[]> | Observable<string[]>;
//# sourceMappingURL=types.d.ts.map