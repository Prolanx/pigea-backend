import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { body } = common.utilities.validators;
const { AuthConstants } = constants;

const forgotPasswordDtoSchema = [
  body('email')
    .trim()
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.EMAIL_REQUIRED)
    .isEmail()
    .withMessage(AuthConstants.VALIDATION.EMAIL_INVALID_ADDRESS)
    .normalizeEmail(),
];

export default forgotPasswordDtoSchema;
