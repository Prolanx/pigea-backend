import { body } from '@common/validators.js';

/**
 * Validation schema for creating a category
 */
const createCategoryDtoSchema = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
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
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ min: 2, max: 500 })
    .withMessage('Description must be between 2 and 500 characters'),
];

export default createCategoryDtoSchema;
