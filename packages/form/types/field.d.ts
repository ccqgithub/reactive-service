import { Subject } from 'rxjs';
import RSForm from './form';
import ValidateError from './error';
import { RSFormData, FieldSchema } from './types';
export declare type RSFieldWaiting = {
    promise: Promise<ValidateError[]>;
    resolve: (errors: ValidateError[]) => void;
};
export declare type RSFieldOptions<D> = {
    parent?: RSField<D>;
    form: RSForm<D>;
    namePath: string;
    index: string;
};
export default class RSField<D extends RSFormData> {
    private namePath;
    private ruleValue;
    private rules;
    private reducer;
    private parent;
    private form;
    private waiting;
    private disposers;
    fields: Record<string, RSField<D>> | null;
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
//# sourceMappingURL=field.d.ts.map