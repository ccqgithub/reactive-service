export class ValidateError extends Error {
  field: string;

  constructor(message: string, field: string) {
    super(message);
    this.field = field;
  }

  toString() {
    return `${this.field}: ${super.toString()}`;
  }
}
