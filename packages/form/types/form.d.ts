import { BehaviorSubject } from 'rxjs';
import RSField from './field';
import ValidateError from './error';
import { BuildFormSchema, RSFormData } from './types';
declare type RSFormOptions = {
    validateOnlyFormTouched?: boolean;
    validateOnFieldTouched?: boolean;
    firstRuleError?: boolean;
};
export default class RSForm<D extends RSFormData = RSFormData> {
    private buildSchema;
    private formField;
    private disposers;
    options: RSFormOptions;
    data$$: BehaviorSubject<D>;
    touched$$: BehaviorSubject<boolean>;
    validating$$: BehaviorSubject<boolean>;
    errors$$: BehaviorSubject<ValidateError[]>;
    fields$$: BehaviorSubject<Record<string, RSField<D>>>;
    get data(): D;
    get touched(): boolean;
    get validating(): boolean;
    get errors(): ValidateError[];
    get fields(): Record<string, RSField<D>>;
    get canValidate(): boolean;
    constructor(buildSchema: BuildFormSchema<D>, data: D, options?: RSFormOptions);
    private getFormFieldSchema;
    onUpdate(data: Partial<D>): void;
    onChangeStatus(): void;
    reset(data: D): void;
    validate(): Promise<ValidateError[]>;
    dispose(): void;
}
export {};
//# sourceMappingURL=form.d.ts.map