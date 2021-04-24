import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export declare class Field {
    private index;
    private namePath;
    private rules;
    private shouldValidate;
    private fields;
    value$$: BehaviorSubject<FieldValue>;
    validating$$: BehaviorSubject<boolean>;
    errors$$: BehaviorSubject<ValidateError[]>;
    validate$: Subject<any>;
    private form;
    private waiting;
    private disposers;
    get value(): any;
    get errors(): ValidateError[];
    get fieldErrors(): FieldErrors;
    get validating(): boolean;
    constructor(schema: FieldSchema, value: FieldValue, options: RSFieldOptions);
    private updateFields;
    update(schema: FieldSchema, value: FieldValue): void;
    private validateRules;
    private validateRule;
    private validateFields;
    private validateAll;
    validateWait(): Observable<ValidateError[]>;
    validate(): Promise<ValidateError[]>;
    private getSubValue;
    dispose(): void;
}

export declare type FieldErrors = Record<string, {
    errors: ValidateError[];
    fields: FieldErrors;
}>;

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
};

export declare type FieldSchema = {
    name?: string;
    rules: FieldRule[];
    fields?: FieldSchema[] | Record<string, FieldSchema>;
};

export declare type FieldValue = any;

export declare class Form<D extends RSFormData = RSFormData> {
    private schema;
    private disposers;
    private form;
    private waiting;
    dirty: boolean;
    data$$: BehaviorSubject<D>;
    validating$$: BehaviorSubject<boolean>;
    errors$$: BehaviorSubject<ValidateError[]>;
    fields$$: BehaviorSubject<FieldErrors>;
    validate$: Subject<any>;
    get data(): D;
    get validating(): boolean;
    get errors(): ValidateError[];
    get fields(): FieldErrors;
    constructor(schema: FormSchema<D>, data: D);
    private getFormFieldSchema;
    updateErrors(): void;
    update(data: Partial<D>): void;
    validate(): Promise<ValidateError[]>;
    dispose(): void;
}

export declare type FormSchema<D extends RSFormData = RSFormData> = Record<string, FieldSchema> | ((data: D) => Record<string, FieldSchema>);

export declare const messages: any;

declare type RSFieldOptions = {
    form: Form;
    name: string;
    namePath: string;
    index: string;
};

export declare type RSFormData = Record<string, any>;

declare class ValidateError extends Error {
    self?: boolean;
    constructor(message: string, self?: boolean);
}

export declare type Validator = (rule: FieldRule, value: FieldValue, source: RSFormData, Options: Record<string, any>) => string[] | Promise<string[]> | Observable<string[]>;

export { }
