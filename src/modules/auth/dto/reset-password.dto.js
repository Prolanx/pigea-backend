import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { body } = common.utilities.validators;
const { AuthConstants } = constants;

const resetPasswordDtoSchema = [
  body('token')
    .trim()
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.RESET_CODE_REQUIRED)
    .isLength({ min: 5, max: 6 })
    .withMessage(AuthConstants.VALIDATION.RESET_CODE_FORMAT)
    .isNumeric()
    .withMessage(AuthConstants.VALIDATION.RESET_CODE_NUMERIC),

  body('newPassword')
    .trim()
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.NEW_PASSWORD_REQUIRED),
];

export default resetPasswordDtoSchema;
