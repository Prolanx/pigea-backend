import { body } from '@common/validators.js';

/**
 * Validation schema for updating invoice status
 * Pure schema definition - handler applied via validateDto middleware
 */
const updateStatusDtoSchema = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'sent', 'paid', 'cancelled'])
    .withMessage('Status must be one of: draft, sent, paid, cancelled')
];

export default updateStatusDtoSchema;
