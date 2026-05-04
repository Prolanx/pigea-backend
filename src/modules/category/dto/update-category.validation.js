import { body } from '@common/validators.js';

/**
 * Validation schema for updating a category
 */
const updateCategoryDtoSchema = [
  body('name')
    .optional()
    .isString()
    .withMessage('Category name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  body('imageUrl')
    .optional()
    .isString()
    .withMessage('Image URL must be a string')
    .trim(),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

export default updateCategoryDtoSchema;
