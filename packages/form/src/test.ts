import { FieldsSchema } from './types';

type FieldOptions = {
  name: string;
  defaultValue: any;
};

class Field {
  name: string;
  defaultValue: any;
  value: any;
  isTouched = false;
  isDirty = false;
  isValidating = false;

  constructor(opts: FieldOptions) {
    const { name, defaultValue } = opts;
    this.name = name;
    this.defaultValue = defaultValue;
    this.value = defaultValue;
  }

  onTouch() {
    this.isTouched = true;
  }

  onChange(value: any) {
    const lastValue = this.value;
    this.value = value;
    if (lastValue !== this.value && !this.isDirty) {
      this.isDirty = true;
    }
  }

  onValidate() {
    this.isValidating = true;
  }

  dispose() {
    //
  }
}

class Fields {
  fields: Record<string, Field> = {};
  schema: FieldsSchema;

  constructor(key: string, schema: FieldsSchema) {
    this.schema = schema;
  }

  register(key: string, opts: FieldOptions) {
    const s = this.schema[key];

    if (!s) {
      throw new Error(`The key [${key}] not defined in the schema!`);
    }

    if (this.fields[key]) {
      throw new Error(`Duplicate register field [${key}]`);
    }

    this.fields[key] = new Field(opts);
  }

  unregister(key: string) {
    const field = this.fields[key];

    if (!field) {
      throw new Error(`The field [${key}] not registed!`)
    }

    field.dispose();
    delete this.fields[key];
  }

  useFields(key: string) {
    //
  }
}

type Values = {
  username: string;
  email: string;
  bag: {
    fileds: {
      color: string;
    };
  };
  friends: {
    fileds: {
      name: string;
    };
  };
};
class Form {
  //
}
