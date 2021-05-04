import { Subject, EMPTY, of, Observable, from, zip, concat, BehaviorSubject } from 'rxjs';
import { tap, switchMap, catchError, concatMap, reduce, map } from 'rxjs/operators';

const formatRegExp = /%[sdj%]/g;
function format(f, ...args) {
    let i = 0;
    const len = args.length;
    if (typeof f === 'function') {
        return f(...args);
    }
    if (typeof f === 'string') {
        const str = f.replace(formatRegExp, (x) => {
            if (x === '%%') {
                return '%';
            }
            if (i >= len) {
                return x;
            }
            switch (x) {
                case '%s':
                    return args[i++];
                case '%d':
                    return args[i++];
                case '%j':
                    try {
                        return JSON.stringify(args[i++]);
                    }
                    catch (_) {
                        return '[Circular]';
                    }
                default:
                    return x;
            }
        });
        return str;
    }
    return f;
}
function isNativeStringType(type) {
    return (type === 'string' ||
        type === 'url' ||
        type === 'hex' ||
        type === 'email' ||
        type === 'date' ||
        type === 'pattern');
}
function isEmptyValue(value, type) {
    if (value === undefined || value === null) {
        return true;
    }
    if (type === 'array' && Array.isArray(value) && !value.length) {
        return true;
    }
    if (isNativeStringType(type) && typeof value === 'string' && !value) {
        return true;
    }
    return false;
}

function required(rule, value, source, options) {
    if (!rule.required)
        return [];
    const errors = [];
    if (isEmptyValue(value, rule.type)) {
        errors.push(format(options.messages.required, options.fullField));
    }
    return errors;
}

function notWhitespace(rule, value, source, options) {
    if (!rule.notWhitespace)
        return [];
    const errors = [];
    if (/^\s+$/.test(value) || value === '') {
        errors.push(format(options.messages.notWhitespace, options.fullField));
    }
    return errors;
}

/* eslint max-len:0 */
const pattern$1 = {
    // http://emailregex.com/
    // eslint-disable-next-line no-useless-escape
    email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    url: new RegExp('^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$', 'i'),
    hex: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i
};
const types = {
    integer(value) {
        return types.number(value) && parseInt(value, 10) === value;
    },
    float(value) {
        return types.number(value) && !types.integer(value);
    },
    array(value) {
        return Array.isArray(value);
    },
    regexp(value) {
        if (value instanceof RegExp) {
            return true;
        }
        try {
            return !!new RegExp(value);
        }
        catch (e) {
            return false;
        }
    },
    date(value) {
        return (typeof value.getTime === 'function' &&
            typeof value.getMonth === 'function' &&
            typeof value.getYear === 'function' &&
            !isNaN(value.getTime()));
    },
    number(value) {
        if (isNaN(value)) {
            return false;
        }
        return typeof value === 'number';
    },
    object(value) {
        return typeof value === 'object' && !types.array(value);
    },
    method(value) {
        return typeof value === 'function';
    },
    email(value) {
        return (typeof value === 'string' &&
            !!value.match(pattern$1.email) &&
            value.length < 255);
    },
    url(value) {
        return typeof value === 'string' && !!value.match(pattern$1.url);
    },
    hex(value) {
        return typeof value === 'string' && !!value.match(pattern$1.hex);
    }
};
function type(rule, value, source, options) {
    const errors = [];
    const ruleType = rule.type;
    if (!ruleType)
        return errors;
    if (isEmptyValue(value, rule.type)) {
        return errors;
    }
    const custom = [
        'integer',
        'float',
        'array',
        'regexp',
        'object',
        'method',
        'email',
        'number',
        'date',
        'url',
        'hex'
    ];
    if (custom.indexOf(ruleType) > -1) {
        if (!types[ruleType](value)) {
            errors.push(format(options.messages.types[ruleType], options.fullField, ruleType));
        }
        // straight typeof check
    }
    else if (ruleType && typeof value !== ruleType) {
        errors.push(format(options.messages.types[ruleType], options.fullField, ruleType));
    }
    return errors;
}

function range(rule, value, source, options) {
    const errors = [];
    const len = typeof rule.len === 'number';
    const min = typeof rule.min === 'number';
    const max = typeof rule.max === 'number';
    if (!len && !min && !max)
        return errors;
    // 正则匹配码点范围从U+010000一直到U+10FFFF的文字（补充平面Supplementary Plane）
    const spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    let val = value;
    let key = null;
    const num = typeof value === 'number';
    const str = typeof value === 'string';
    const arr = Array.isArray(value);
    if (num) {
        key = 'number';
    }
    else if (str) {
        key = 'string';
    }
    else if (arr) {
        key = 'array';
    }
    // if the value is not of a supported type for range validation
    // the validation rule rule should use the
    // type property to also test for a particular type
    if (!key) {
        return errors;
    }
    if (arr) {
        val = value.length;
    }
    if (str) {
        // 处理码点大于U+010000的文字length属性不准确的bug，如"𠮷𠮷𠮷".lenght !== 3
        val = value.replace(spRegexp, '_').length;
    }
    if (len) {
        if (val !== rule.len) {
            errors.push(format(options.messages[key].len, options.fullField, rule.len));
        }
    }
    else if (min && !max && val < rule.min) {
        errors.push(format(options.messages[key].min, options.fullField, rule.min));
    }
    else if (max && !min && val > rule.max) {
        errors.push(format(options.messages[key].max, options.fullField, rule.max));
    }
    else if (min && max && (val < rule.min || val > rule.max)) {
        errors.push(format(options.messages[key].range, options.fullField, rule.min, rule.max));
    }
    return errors;
}

const ENUM = 'enum';
function enumerable(rule, value, source, options) {
    if (!rule[ENUM] || !Array.isArray(rule[ENUM]))
        return [];
    const errors = [];
    if (rule[ENUM].indexOf(value) === -1) {
        errors.push(format(options.messages[ENUM], options.fullField, rule[ENUM].join(', ')));
    }
    return errors;
}

function pattern(rule, value, source, options) {
    if (!rule.pattern)
        return [];
    const errors = [];
    if (rule.pattern instanceof RegExp) {
        // if a RegExp instance is passed, reset `lastIndex` in case its `global`
        // flag is accidentally set to `true`, which in a validation scenario
        // is not necessary and the result might be misleading
        rule.pattern.lastIndex = 0;
        if (!rule.pattern.test(value)) {
            errors.push(format(options.messages.pattern.mismatch, options.fullField, value, rule.pattern));
        }
    }
    else if (typeof rule.pattern === 'string') {
        const _pattern = new RegExp(rule.pattern);
        if (!_pattern.test(value)) {
            errors.push(format(options.messages.pattern.mismatch, options.fullField, value, rule.pattern));
        }
    }
    return errors;
}

var builtinRules = {
    required,
    notWhitespace,
    type,
    range,
    enum: enumerable,
    pattern
};

function newMessages() {
    return {
        default: 'Validation error on field %s',
        required: '%s is required',
        enum: '%s must be one of %s',
        notWhitespace: '%s cannot be empty',
        date: {
            format: '%s date %s is invalid for format %s',
            parse: '%s date could not be parsed, %s is invalid ',
            invalid: '%s date %s is invalid'
        },
        types: {
            string: '%s is not a %s',
            method: '%s is not a %s (function)',
            array: '%s is not an %s',
            object: '%s is not an %s',
            number: '%s is not a %s',
            date: '%s is not a %s',
            boolean: '%s is not a %s',
            integer: '%s is not an %s',
            float: '%s is not a %s',
            regexp: '%s is not a valid %s',
            email: '%s is not a valid %s',
            url: '%s is not a valid %s',
            hex: '%s is not a valid %s'
        },
        string: {
            len: '%s must be exactly %s characters',
            min: '%s must be at least %s characters',
            max: '%s cannot be longer than %s characters',
            range: '%s must be between %s and %s characters'
        },
        number: {
            len: '%s must equal %s',
            min: '%s cannot be less than %s',
            max: '%s cannot be greater than %s',
            range: '%s must be between %s and %s'
        },
        array: {
            len: '%s must be exactly %s in length',
            min: '%s cannot be less than %s in length',
            max: '%s cannot be greater than %s in length',
            range: '%s must be between %s and %s in length'
        },
        pattern: {
            match: '%s value %s does not match pattern %s'
        },
        clone() {
            const cloned = JSON.parse(JSON.stringify(this));
            cloned.clone = this.clone;
            return cloned;
        }
    };
}
const messages = newMessages();

class ValidateError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
    }
}

class RSField {
    constructor(schema, options) {
        this.waiting = null;
        this.disposers = [];
        this.fields = null;
        this.errors = [];
        this.validating = false;
        this.touched = false;
        this.dirty = false;
        this.validate$ = new Subject();
        const { ruleValue, rules = [], reducer = (data) => data } = schema;
        const { namePath, form, parent } = options;
        this.ruleValue = ruleValue;
        this.rules = rules;
        this.reducer = reducer;
        this.namePath = namePath;
        this.form = form;
        this.parent = parent || null;
        this.setSchema(schema);
        // validate
        const subscription = this.validate$
            .pipe(tap(() => {
            this.validating = true;
            this.dirty = false;
            // waiting
            const waiting = {};
            waiting.promise = new Promise((resolve) => {
                waiting.resolve = resolve;
            });
            this.waiting = waiting;
            this.form.onChangeStatus();
        }), switchMap(() => {
            return this.validateAll();
        }), tap((errors) => {
            this.validating = false;
            this.errors = [...errors];
            this.waiting?.resolve(errors);
            this.form.onChangeStatus();
        }), catchError((error, caught) => {
            return caught;
        }))
            .subscribe();
        this.disposers.push(() => {
            subscription.unsubscribe();
        });
        // 如果表单验证过，则字段初始化时候就验证
        if (this.form.touched) {
            this.validate$.next();
        }
    }
    get fieldErrors() {
        const fields = this.fields || {};
        let errs = [];
        Object.keys(fields).forEach((key) => {
            const { errors, fieldErrors } = fields[key];
            errs = [...errs, ...errors, ...fieldErrors];
        });
        return errs;
    }
    get needValidate() {
        return (this.form.canValidate &&
            ((this.form.options.validateOnFieldTouched &&
                this.touched &&
                !this.waiting) ||
                this.dirty));
    }
    setTouch() {
        if (this.touched)
            return;
        this.touched = true;
        this.upTouch();
        this.downTouch();
        origin && this.form.onChangeStatus();
    }
    upTouch() {
        this.touched = true;
        this.parent?.upTouch();
    }
    downTouch() {
        this.touched = true;
        if (this.fields) {
            Object.keys(this.fields).forEach((key) => {
                this.fields[key].downTouch();
            });
        }
    }
    onChange(value) {
        // touched
        this.setTouch();
        // dirty
        this.setDirty();
        // update form data
        this.form.onUpdate(this.reducer(this.form.data, value));
    }
    setDirty() {
        if (this.dirty)
            return;
        this.dirty = true;
        this.upDirty();
        this.downDirty();
    }
    upDirty() {
        this.dirty = true;
        this.parent?.upDirty();
    }
    downDirty() {
        this.dirty = true;
        if (this.fields) {
            Object.keys(this.fields).forEach((key) => {
                this.fields[key].downDirty();
            });
        }
    }
    validate(fromFields = false) {
        if (!this.waiting || this.dirty) {
            if (fromFields) {
                this.validate$.next();
            }
            else {
                this.upValidate();
            }
        }
        return this.waiting.promise;
    }
    upValidate() {
        this.validate$.next();
        this.parent?.upValidate();
    }
    checkValidate() {
        if (this.needValidate) {
            this.validate$.next();
        }
        if (this.fields) {
            Object.keys(this.fields).forEach((key) => {
                this.fields[key].checkValidate();
            });
        }
    }
    forceValidate(fromFields = false) {
        if (fromFields) {
            this.validate$.next();
        }
        else {
            this.upValidate();
        }
        return this.waiting.promise;
    }
    updateSchema(schema) {
        const { ruleValue, rules = [] } = schema;
        this.rules = rules;
        this.ruleValue = ruleValue;
        this.setSchema(schema);
    }
    dispose() {
        this.disposers.forEach((disposer) => {
            disposer();
        });
        this.disposers = [];
        if (this.fields) {
            Object.keys(this.fields).forEach((key) => {
                this.fields[key].dispose();
            });
        }
    }
    setSchema(schema) {
        const newFields = {};
        const fields = schema.fields;
        if (Array.isArray(fields)) {
            fields.forEach((item, index) => {
                if (!item.key)
                    throw new Error('Array field need a key property!');
                newFields[item.key] = { ...item, index: `${index}` };
            });
        }
        else if (typeof fields === 'object' && fields !== null) {
            Object.keys(fields).forEach((key) => {
                newFields[key] = {
                    ...fields[key],
                    key,
                    index: key
                };
            });
        }
        const oldKeys = Object.keys(this.fields || {});
        const newKeys = Object.keys(newFields);
        if (this.fields) {
            const fields = this.fields;
            oldKeys.forEach((key) => {
                if (newKeys.indexOf(key) === -1) {
                    fields[key].dispose();
                    delete fields[key];
                }
            });
        }
        if (newKeys.length) {
            if (!this.fields)
                this.fields = {};
        }
        else {
            this.fields = null;
        }
        if (this.fields) {
            const fields = this.fields;
            newKeys.forEach((key) => {
                if (oldKeys.indexOf(key) === -1) {
                    fields[key] = new RSField(newFields[key], {
                        parent: this,
                        form: this.form,
                        namePath: this.namePath
                            ? `${this.namePath}.${newFields[key].index}`
                            : newFields[key].index,
                        index: newFields[key].index
                    });
                }
                else {
                    fields[key].updateSchema(newFields[key]);
                }
            });
        }
    }
    validateRules() {
        const { ruleValue, rules, form } = this;
        if (!rules.length)
            return EMPTY;
        // firstRuleError
        const firstRuleError = form.options.firstRuleError;
        let hasError = false;
        return of(...rules).pipe(concatMap((rule) => {
            return of('').pipe(switchMap(() => {
                if (hasError && firstRuleError)
                    return EMPTY;
                return this.validateRule(rule, ruleValue, form.data);
            }), tap((errors) => {
                if (errors.length)
                    hasError = true;
            }));
        }), reduce((prev, cur) => prev.concat(...cur), []), map((errors) => {
            return errors.map((err) => {
                return new ValidateError(err, this.namePath);
            });
        }));
    }
    validateRule(rule, value, source) {
        const errors = [];
        const ruleKeys = [
            'required',
            'type',
            'range',
            'pattern',
            'enum',
            'notWhitespace'
        ];
        ruleKeys.forEach((key) => {
            const ruleFunc = builtinRules[key];
            const customMessage = (rule.messages || {})[key];
            let errs = ruleFunc(rule, value, source, {
                messages,
                fullField: this.namePath
            });
            if (errs.length && customMessage) {
                errs = [customMessage];
            }
            errors.push(...errs);
        });
        let v$ = null;
        if (rule.validator) {
            const res = rule.validator(rule, value, source, {
                messages,
                fullField: this.namePath
            });
            if (res instanceof Observable) {
                v$ = res;
            }
            else if (res instanceof Promise) {
                v$ = from(res);
            }
            else {
                v$ = of(res);
            }
        }
        if (v$) {
            return v$.pipe(map((errs) => {
                return errors.concat(...errs);
            }), map((errs) => {
                if (rule.message)
                    return [rule.message];
                return errs;
            }));
        }
        return of(errors.length && rule.message ? [rule.message] : errors);
    }
    validateFields() {
        const fields = this.fields || {};
        const keys = Object.keys(fields);
        const arr = keys.map((key) => {
            return from(fields[key].validate(true));
        });
        return zip(...arr).pipe(map((arr) => {
            return arr.reduce((prev, cur) => [...prev, ...cur], []);
        }));
    }
    validateAll() {
        return concat(this.validateRules(), this.validateFields()).pipe(reduce((prev, cur) => prev.concat(...cur), []));
    }
}

class RSForm {
    constructor(buildSchema, data, options = {}) {
        this.disposers = [];
        // 是否提交过
        this.touched$$ = new BehaviorSubject(false);
        // 正在提交
        this.validating$$ = new BehaviorSubject(false);
        // 错误
        this.errors$$ = new BehaviorSubject([]);
        const { validateOnlyFormTouched = false, validateOnFieldTouched = false, firstRuleError = true } = options;
        this.options = {
            validateOnlyFormTouched,
            validateOnFieldTouched,
            firstRuleError
        };
        this.buildSchema = buildSchema;
        this.data$$ = new BehaviorSubject(data);
        this.formField = new RSField(this.getFormFieldSchema(data), {
            form: this,
            namePath: '',
            index: ''
        });
        this.fields$$ = new BehaviorSubject(this.formField.fields);
    }
    get data() {
        return this.data$$.value;
    }
    get touched() {
        return this.touched$$.value;
    }
    get validating() {
        return this.validating$$.value;
    }
    get errors() {
        return this.errors$$.value;
    }
    get fields() {
        return this.fields$$.value;
    }
    get canValidate() {
        return !(!this.touched && this.options.validateOnlyFormTouched);
    }
    getFormFieldSchema(data) {
        const { buildSchema } = this;
        const fields = buildSchema(data);
        return {
            ruleValue: data,
            rules: [],
            fields,
            reducer: (data, v) => v
        };
    }
    onUpdate(data) {
        const newData = { ...this.data, ...data };
        const schema = this.getFormFieldSchema(newData);
        this.data$$.next(newData);
        this.formField.updateSchema(schema);
        this.onChangeStatus();
        this.formField.checkValidate();
    }
    onChangeStatus() {
        const { fieldErrors } = this.formField;
        this.validating$$.next(this.formField.validating);
        this.errors$$.next([...fieldErrors]);
        this.fields$$.next({
            ...this.formField.fields
        });
    }
    reset(data) {
        this.touched$$.next(false);
        this.data$$.next(data);
        this.formField = new RSField(this.getFormFieldSchema(data), {
            form: this,
            namePath: '',
            index: ''
        });
        this.fields$$.next({
            ...this.formField.fields
        });
        this.errors$$.next([...this.formField.fieldErrors]);
    }
    validate() {
        !this.touched && this.touched$$.next(true);
        return this.formField.validate();
    }
    dispose() {
        this.disposers.forEach((disposer) => {
            disposer();
        });
    }
}

export { RSField as Field, RSForm as Form, messages };
