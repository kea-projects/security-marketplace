class BaseError {
  error: string;
  detail: string;

  constructor(error: string, detail: string) {
    this.error = error;
    this.detail = detail;
  }
}

class MissingPropertyError extends BaseError {
  constructor(property: string) {
    super("MissingProperty", `property: '${property}' is missing`);
  }
}

class ValidationError extends BaseError {
  constructor(error: string) {
    super("ValidationError", error);
  }
}

export { MissingPropertyError, ValidationError };
