/**
 * Custom error class for Controller-level errors
 */
class ControllerError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ControllerError';
    this.type = 'CONTROLLER_ERROR';
    this.statusCode = statusCode;
  }
}

/**
 * Custom error class for DAO/Database-level errors
 */
class DAOError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'DAOError';
    this.type = 'DAO_ERROR';
    this.statusCode = statusCode;
  }
}

export { ControllerError, DAOError };
