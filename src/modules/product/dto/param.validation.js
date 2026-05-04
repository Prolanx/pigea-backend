import { param } from '@common/validators.js';

/**
 * Validation schema for product ID parameter
 */
export const productIdParamDtoSchema = [
  param('id')
    .notEmpty()
    .withMessage('Product ID is required'),
];
