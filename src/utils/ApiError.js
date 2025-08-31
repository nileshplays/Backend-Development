
// A custom Error with an HTTP status and optional error details.
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong!",
    errors = [],
    stack = "" // fixed name
  ) {
    super(message); // set the built-in Error message

    // add extra fields useful for API responses
    this.statusCode = statusCode; // e.g., 400, 404, 500
    this.data = null;             // space if you want to attach extra data later
    this.success = false;         // errors => success is false
    this.errors = errors;         // array of details (validation issues, etc.)

    // keep a proper stack trace (very helpful for debugging)
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
