import { body } from '@common/validators.js';

// Minimal standard validation: require fields and ensure they are strings (email uses isEmail)
const contactDtoSchema = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .bail()
    .isString()
    .withMessage('First name must be a string')
    .trim(),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .bail()
    .isString()
    .withMessage('Last name must be a string')
    .trim(),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Invalid email format')
    .trim()
    .normalizeEmail(),

  body('phone')
    .optional()
    .isString()
    .withMessage('Phone must be a string')
    .trim(),

  body('userType')
    .notEmpty()
    .withMessage('User type is required')
    .bail()
    .isString()
    .withMessage('User type must be a string')
    .isIn(['business owner', 'founder', 'investor', 'entrepreneur', 'team member', 'others'])
    .withMessage('Invalid user type'),

  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .bail()
    .isString()
    .withMessage('Message must be a string')
    .trim(),

  body('termsAccepted')
    .notEmpty()
    .withMessage('Terms acceptance is required')
    .bail()
    .isBoolean()
    .withMessage('Terms acceptance must be a boolean')
    .custom((value) => value === true)
    .withMessage('You must accept the terms and conditions')
];

export default contactDtoSchema;
