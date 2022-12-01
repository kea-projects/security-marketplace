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
  constructor(detail: string) {
    super("ValidationError", detail);
  }
}

class InternalServerError extends BaseError {
  constructor(detail: string = "An unknown error has occurred.") {
    super("InternalServerError", detail);
  }
}

export { MissingPropertyError, ValidationError, InternalServerError};
