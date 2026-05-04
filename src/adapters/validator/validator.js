import { validationResult, body, param, query } from 'express-validator';

/**
 * Express-validator adapter
 * Wraps express-validator implementation so it can be swapped later
 */

/**
 * Validates express-validator results and formats errors
 * @param {Request} req - Express request object
 * @throws {Object} Validation errors object
 */
export const validateExpressValidator = (req) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = {};
    
    // Format errors into a nice object
    errors.array().forEach((error) => {
      if (error.path) {
        validationErrors[error.path] = error.msg;
      }
    });
    
    throw validationErrors;
  }
};

/**
 * Re-export express-validator functions
 * If switching to another library, these would be replaced
 */
export { body, param, query };
