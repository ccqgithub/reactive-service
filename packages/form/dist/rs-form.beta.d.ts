import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export declare type BuildFormSchema<D extends RSFormData> = (data: D) => Record<string, FieldSchema<D>>;

export declare class Field<D extends RSFormData> {
    private namePath;
    private ruleValue;
    private rules;
    private reducer;
    private parent;
    private form;
    private waiting;
    private disposers;
    fields: Record<string, Field<D>> | null;
    errors: ValidateError[];
    validating: boolean;
    touched: boolean;
    dirty: boolean;
    validate$: Subject<any>;
    get fieldErrors(): ValidateError[];
    get needValidate(): boolean;
    constructor(schema: FieldSchema<D>, options: RSFieldOptions<D>);
    setTouch(): void;
    upTouch(): void;
    downTouch(): void;
    onChange(value: any): void;
    setDirty(): void;
    upDirty(): void;
    downDirty(): void;
    validate(fromFields?: boolean): Promise<ValidateError[]>;
    upValidate(): void;
    checkValidate(): void;
    forceValidate(fromFields?: boolean): Promise<ValidateError[]>;
    updateSchema(schema: FieldSchema<D>): void;
    dispose(): void;
    private setSchema;
    private validateRules;
    private validateRule;
    private validateFields;
    private validateAll;
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
    messages?: Record<string, string>;
};

export declare type FieldSchema<D extends RSFormData = RSFormData> = {
    key?: string;
    ruleValue: any;
    rules: FieldRule[];
    fields?: FieldSchema<D>[] | Record<string, FieldSchema<D>>;
    reducer?: (data: D, value: any) => D;
};

export declare type FieldType = {
    value?: any;
    fields?: Record<string, FieldType>;
};

export declare class Form<D extends RSFormData = RSFormData> {
    private buildSchema;
    private formField;
    private disposers;
    options: RSFormOptions;
    data$$: BehaviorSubject<D>;
    touched$$: BehaviorSubject<boolean>;
    validating$$: BehaviorSubject<boolean>;
    errors$$: BehaviorSubject<ValidateError[]>;
    fields$$: BehaviorSubject<Record<string, Field<D>>>;
    get data(): D;
    get touched(): boolean;
    get validating(): boolean;
    get errors(): ValidateError[];
    get fields(): Record<string, Field<D>>;
    get canValidate(): boolean;
    constructor(buildSchema: BuildFormSchema<D>, data: D, options?: RSFormOptions);
    private getFormFieldSchema;
    onUpdate(data: Partial<D>): void;
    onChangeStatus(): void;
    reset(data: D): void;
    validate(): Promise<ValidateError[]>;
    dispose(): void;
}

export declare const messages: any;

declare type RSFieldOptions<D> = {
    parent?: Field<D>;
    form: Form<D>;
    namePath: string;
    index: string;
};

export declare type RSFormData = Record<string, any>;

declare type RSFormOptions = {
    validateOnlyFormTouched?: boolean;
    validateOnFieldTouched?: boolean;
    firstRuleError?: boolean;
};

declare class ValidateError extends Error {
    field: string;
    constructor(message: string, field: string);
}

export declare type Validator = (rule: FieldRule, value: any, source: RSFormData, Options: Record<string, any>) => string[] | Promise<string[]> | Observable<string[]>;

export { }
