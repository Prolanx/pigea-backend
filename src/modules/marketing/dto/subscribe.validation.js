import { body } from '@common/validators.js';

const subscribeDtoSchema = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Invalid email format')
    .trim()
    .normalizeEmail()
];

export default subscribeDtoSchema;
