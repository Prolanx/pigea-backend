import { body } from '@common/validators.js';

/**
 * Validation schema for creating a custom field definition
 */
const createFieldDtoSchema = [
  body('name')
    .notEmpty().withMessage('Field name is required')
    .isString().withMessage('Field name must be a string')
    .isLength({ min: 1, max: 100 }).withMessage('Field name must be 1-100 characters')
    .matches(/^[A-Za-z0-9_\- ]+$/).withMessage('Field name can only contain letters, numbers, underscores, hyphens, and spaces')
    .trim(),

  body('type')
    .notEmpty()
    .withMessage('Field type is required')
    .isIn(['text', 'select', 'date'])
    .withMessage('Field type must be one of: text, select, date'),

  body('options')
    .optional()
    .isArray()
    .withMessage('Options must be an array'),

  body('options.*')
    .optional()
    .isString()
    .withMessage('Each option must be a string')
    .trim(),
];

export default createFieldDtoSchema;
