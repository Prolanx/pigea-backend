import { common } from '@common/_index.js';

const { body } = common.utilities.validators;

const autoLoginDtoSchema = [
  body('email')
    .notEmpty()
    .bail()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

export default autoLoginDtoSchema;
