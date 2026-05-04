import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { body } = common.utilities.validators;
const { AuthConstants } = constants;

const resendVerificationDtoSchema = [
  body('email')
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.EMAIL_REQUIRED)
    .isEmail()
    .withMessage(AuthConstants.VALIDATION.EMAIL_INVALID)
    .normalizeEmail(),
];

export default resendVerificationDtoSchema;
