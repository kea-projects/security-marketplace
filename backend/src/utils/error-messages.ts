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

class InternalServerError extends BaseError {
  constructor(error: string = "An unknown error has occurred.") {
    super("InternalServerError", error);
  }
}

export { MissingPropertyError, ValidationError, InternalServerError};
