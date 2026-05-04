import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { body } = common.utilities.validators;
const { AuthConstants } = constants;

const loginDtoSchema = [
  body('email')
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.EMAIL_REQUIRED)
    .isEmail()
    .withMessage(AuthConstants.VALIDATION.EMAIL_INVALID)
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.PASSWORD_REQUIRED),
];

export default loginDtoSchema;
