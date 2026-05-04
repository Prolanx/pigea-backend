import { body } from '@common/validators.js';

/**
 * Validation schema for updating inventory
 */
const updateInventoryDtoSchema = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt()
    .withMessage('Quantity must be an integer'),
];

export default updateInventoryDtoSchema;
