var RSForm = (function (exports, rxjs) {
        'use strict';

        function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

        var rxjs__default = /*#__PURE__*/_interopDefaultLegacy(rxjs);

        const { catchError, concatAll, reduce, switchMap, tap, skip, map } = rxjs__default.operators;

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
            if (value === null || value === undefined) {
                if (rule.required)
                    return required(rule, value, source, options);
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
            whitespace: notWhitespace,
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
            constructor(message, self = false) {
                super(message);
                this.self = self;
            }
        }

        class RSField {
            constructor(schema, value, options) {
                this.shouldValidate = (value, oldValue) => value !== oldValue;
                this.fields = {};
                this.validating$$ = new rxjs.BehaviorSubject(false);
                this.errors$$ = new rxjs.BehaviorSubject([]);
                this.validate$ = new rxjs.Subject();
                this.waiting = null;
                this.disposers = [];
                const { rules = [] } = schema;
                const { name, namePath, form, index } = options;
                if (typeof name === 'undefined')
                    throw new Error('Need a name for RSField!');
                this.rules = rules;
                this.namePath = namePath;
                this.index = index;
                this.form = form;
                this.value$$ = new rxjs.BehaviorSubject(value);
                this.updateFields(schema, value);
                const subscription = this.validate$
                    .pipe(tap(() => {
                    this.validating$$.next(true);
                    // waiting
                    const waiting = {};
                    waiting.promise = new Promise((resolve) => {
                        waiting.resolve = resolve;
                    });
                    this.waiting = waiting;
                }), switchMap(() => {
                    return this.validateAll();
                }), tap((errors) => {
                    this.validating$$.next(false);
                    this.errors$$.next(errors);
                    this.waiting && this.waiting.resolve(errors);
                }), catchError((error, caught) => {
                    console.log(error);
                    return caught;
                }))
                    .subscribe();
                this.disposers.push(() => {
                    subscription.unsubscribe();
                });
                // errors
                const errorsSub = this.errors$$.pipe(skip(1)).subscribe(() => {
                    this.form.updateErrors();
                });
                this.disposers.push(() => {
                    errorsSub.unsubscribe();
                });
                // 如果表单验证过，则字段初始化时候就验证
                if (this.form.dirty) {
                    this.validate$.next();
                }
            }
            get value() {
                return this.value$$.value;
            }
            get errors() {
                return this.errors$$.value;
            }
            get fieldErrors() {
                const { fields } = this;
                const obj = {};
                Object.keys(fields).forEach((key) => {
                    obj[fields[key].index] = {
                        errors: fields[key].errors,
                        fields: fields[key].fieldErrors
                    };
                });
                return obj;
            }
            get validating() {
                return this.validating$$.value;
            }
            updateFields(schema, value) {
                const newFields = {};
                if (Array.isArray(schema.fields)) {
                    schema.fields.forEach((item, index) => {
                        if (!item.name)
                            throw new Error('Array field need a name property!');
                        newFields[item.name] = { ...item, index: `${index}` };
                    });
                }
                else if (typeof schema.fields === 'object') {
                    Object.keys(schema.fields).forEach((key) => {
                        newFields[key] = {
                            ...schema.fields[key],
                            name: key,
                            index: key
                        };
                    });
                }
                const oldKeys = Object.keys(this.fields);
                const newKeys = Object.keys(newFields);
                oldKeys.forEach((key) => {
                    if (newKeys.indexOf(key) === -1) {
                        this.fields[key].dispose();
                        delete this.fields[key];
                    }
                });
                newKeys.forEach((key) => {
                    if (oldKeys.indexOf(key) === -1) {
                        this.fields[key] = new RSField(newFields[key], this.getSubValue(value, newFields[key].index), {
                            form: this.form,
                            name: key,
                            namePath: this.namePath
                                ? `${this.namePath}.${newFields[key].index}`
                                : newFields[key].index,
                            index: newFields[key].index
                        });
                    }
                    else {
                        this.fields[key].update(newFields[key], this.getSubValue(value, newFields[key].index));
                    }
                });
            }
            update(schema, value) {
                const { rules = [] } = schema;
                this.rules = rules;
                const shouldValidate = this.shouldValidate(value, this.value);
                this.value$$.next(value);
                this.updateFields(schema, value);
                shouldValidate && this.validate$.next();
            }
            validateRules() {
                const { value, rules, form } = this;
                const obArr = rules.map((rule) => {
                    return this.validateRule(rule, value, form.data);
                });
                return rxjs.of(...obArr).pipe(concatAll(), reduce((prev, cur) => prev.concat(...cur), []), map((errors) => {
                    return errors.map((err) => {
                        return new ValidateError(err, true);
                    });
                }));
            }
            validateRule(rule, value, source) {
                const errors = [];
                const rules = Object.keys(builtinRules);
                rules.forEach((key) => {
                    errors.push(...builtinRules[key](rule, value, source, {
                        messages,
                        fullField: this.namePath
                    }));
                });
                let v$ = null;
                if (rule.validator) {
                    const res = rule.validator(rule, value, source, {
                        messages,
                        fullField: this.namePath
                    });
                    if (res instanceof rxjs.Observable) {
                        v$ = res;
                    }
                    else if (res instanceof Promise) {
                        v$ = rxjs.from(res);
                    }
                    else {
                        v$ = rxjs.of(res);
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
                return rxjs.of(rule.message ? [rule.message] : errors);
            }
            validateFields() {
                const { fields } = this;
                const keys = Object.keys(fields);
                const arr = keys.map((key) => {
                    return fields[key].validateWait();
                });
                return rxjs.zip(...arr).pipe(map((arr) => {
                    return arr.reduce((prev, cur) => [...prev, ...cur], []);
                }));
            }
            validateAll() {
                return rxjs.concat(this.validateRules(), this.validateFields());
            }
            validateWait() {
                if (this.waiting)
                    return rxjs.from(this.waiting.promise);
                return rxjs.of([]);
            }
            validate() {
                if (!this.waiting)
                    this.validate$.next();
                return this.waiting.promise;
            }
            getSubValue(value, key) {
                if (typeof value !== 'object')
                    return undefined;
                return value[key];
            }
            dispose() {
                this.disposers.forEach((disposer) => {
                    disposer();
                });
                this.disposers = [];
            }
        }

        class RSForm {
            constructor(schema, data) {
                this.disposers = [];
                this.waiting = null;
                this.dirty = false;
                this.validating$$ = new rxjs.BehaviorSubject(false);
                this.errors$$ = new rxjs.BehaviorSubject([]);
                this.fields$$ = new rxjs.BehaviorSubject({});
                this.validate$ = new rxjs.Subject();
                this.schema = schema;
                this.data$$ = new rxjs.BehaviorSubject(data);
                this.form = new RSField(this.getFormFieldSchema(), data, {
                    form: this,
                    name: '',
                    namePath: '',
                    index: ''
                });
                const validate$ = this.validate$.pipe(tap(() => {
                    this.dirty = true;
                    this.validating$$.next(true);
                    // waiting
                    const waiting = {};
                    waiting.promise = new Promise((resolve) => {
                        waiting.resolve = resolve;
                    });
                    this.waiting = waiting;
                }), switchMap(() => {
                    const promise = this.form.validate();
                    return rxjs.from(promise);
                }), tap((errors) => {
                    this.validating$$.next(false);
                    this.errors$$.next(errors);
                    this.waiting && this.waiting.resolve(errors);
                }), catchError((error, caught) => {
                    console.log(error);
                    return caught;
                }));
                const subscription = validate$.subscribe();
                this.disposers.push(() => {
                    subscription.unsubscribe();
                });
            }
            get data() {
                return this.data$$.value;
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
            getFormFieldSchema() {
                const { schema } = this;
                const fields = typeof schema === 'function' ? schema(this.data) : schema;
                return {
                    rules: [],
                    fields
                };
            }
            updateErrors() {
                this.errors$$.next(this.form.errors);
                this.fields$$.next(this.form.fieldErrors);
            }
            update(data) {
                this.data$$.next({
                    ...this.data,
                    ...data
                });
                this.form.update(this.getFormFieldSchema(), this.data);
            }
            validate() {
                if (!this.validating)
                    this.validate$.next();
                return this.waiting.promise;
            }
            dispose() {
                this.disposers.forEach((disposer) => {
                    disposer();
                });
            }
        }

        exports.Field = RSField;
        exports.Form = RSForm;
        exports.messages = messages;

        Object.defineProperty(exports, '__esModule', { value: true });

        return exports;

}({}, rxjs));
