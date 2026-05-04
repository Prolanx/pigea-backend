import { body } from '@common/validators.js';

/**
 * Validation schema for creating a contact type
 */
const createContactTypeDtoSchema = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim(),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),

  body('fields')
    .isArray({ min: 1 })
    .withMessage('Fields must be an array with at least one field'),

  body('fields.*.id')
    .notEmpty()
    .withMessage('Field ID is required for each field')
    .isString()
    .withMessage('Field ID must be a string'),

  body('fields.*.required')
    .isBoolean()
    .withMessage('Required must be a boolean'),
];

export default createContactTypeDtoSchema;
