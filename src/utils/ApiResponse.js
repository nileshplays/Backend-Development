// Make success responses consistent across the app.
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;        // e.g., 200, 201
    this.data = data;                    // actual payload
    this.message = message;              // human-friendly message
    this.success = statusCode < 400;     // success if < 400
  }
}

export { ApiResponse };