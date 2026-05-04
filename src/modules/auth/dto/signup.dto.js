import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { body } = common.utilities.validators;
const { AuthConstants } = constants;

const signupDtoSchema = [
  body('firstName')
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.FIRST_NAME_REQUIRED)
    .isString()
    .withMessage(AuthConstants.VALIDATION.FIRST_NAME_STRING)
    .trim(),

  body('lastName')
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.LAST_NAME_REQUIRED)
    .isString()
    .withMessage(AuthConstants.VALIDATION.LAST_NAME_STRING)
    .trim(),

  body('email')
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.EMAIL_REQUIRED)
    .isEmail()
    .withMessage(AuthConstants.VALIDATION.EMAIL_INVALID)
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.PASSWORD_REQUIRED),
];

export default signupDtoSchema;
