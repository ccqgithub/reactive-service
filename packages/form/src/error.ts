export default class ValidateError extends Error {
  field: string;

  constructor(message: string, field: string) {
    super(message);
    this.field = field;
  }
}
