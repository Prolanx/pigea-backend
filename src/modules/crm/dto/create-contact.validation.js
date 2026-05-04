import { body } from '@common/validators.js';

/**
 * Validation schema for creating a contact
 */
const createContactDtoSchema = [
  body('contactTypeId')
    .notEmpty()
    .withMessage('Contact type ID is required')
    .isMongoId()
    .withMessage('Contact type ID must be a valid MongoDB ObjectId'),

  body('data')
    .notEmpty()
    .withMessage('Contact data is required')
    .isObject()
    .withMessage('Contact data must be an object'),
];

export default createContactDtoSchema;
