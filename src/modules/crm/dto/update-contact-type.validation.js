import { body } from '@common/validators.js';

/**
 * Validation schema for updating a contact type
 */
const updateContactTypeDtoSchema = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim(),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),

  body('fields')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Fields must be an array with at least one field'),

  body('fields.*.id')
    .optional()
    .isString()
    .withMessage('Field ID must be a string'),

  body('fields.*.required')
    .optional()
    .isBoolean()
    .withMessage('Required must be a boolean'),
];

export default updateContactTypeDtoSchema;
