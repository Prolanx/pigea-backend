import { body } from '@common/validators.js';

const updateStatusDtoSchema = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Status name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Status name must be between 2 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Description must not exceed 250 characters'),
  
  body('color')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Color cannot be empty')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code (e.g., #FF5733)'),
];

export default updateStatusDtoSchema;
