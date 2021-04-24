export default class ValidateError extends Error {
  self?: boolean;

  constructor(message: string, self = false) {
    super(message);
    this.self = self;
  }
}
