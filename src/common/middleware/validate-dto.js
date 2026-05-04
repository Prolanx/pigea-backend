import { validateExpressValidator } from '@adapters/validator/validator.js';
import { ResponseUtils } from '@common/utilities/response.js';

/**
 * Generic DTO validation middleware
 * Works with express-validator schemas
 * @param {Array} validationRules - Array of express-validator validation chains
 * @param {String} contextualMessage - Contextual error message (e.g., "Failed to create product")
 * @returns {Function} Express middleware
 */
export const validateDto = (validationRules, contextualMessage = 'Validation failed') => {
  return async (req, res, next) => {
    try {
      // Run all validation rules
      await Promise.all(validationRules.map((validation) => validation.run(req)));
      
      // Check for validation errors
      validateExpressValidator(req);
      
      return next();
    } catch (error) {
      console.error('Validate DTO error:', error);
      
      // If it's validation errors object, format response
      if (typeof error === 'object' && !error.message) {
        return res.status(400).json(ResponseUtils.error(contextualMessage, error));
      }
      
      // Otherwise pass to error handler
      return next(error);
    }
  };
};
