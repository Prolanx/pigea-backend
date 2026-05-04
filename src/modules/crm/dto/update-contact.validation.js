import { body } from '@common/validators.js';

/**
 * Validation schema for updating a contact
 */
const updateContactDtoSchema = [
  body('data')
    .optional()
    .isObject()
    .withMessage('Contact data must be an object'),

  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Converted', 'Lost'])
    .withMessage('Status must be one of: New, Contacted, Converted, Lost'),
];

export default updateContactDtoSchema;
