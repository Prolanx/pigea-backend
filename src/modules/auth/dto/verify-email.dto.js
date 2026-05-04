import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { body } = common.utilities.validators;
const { AuthConstants } = constants;

const verifyEmailDtoSchema = [
  // accept `verificationToken` (preferred) or `token` (backwards-compatible)
  body('verificationToken').custom((value, { req }) => {
    // require at least one of { verificationToken, token }
    if (!value && !req.body.token) {
      throw new Error(AuthConstants.VALIDATION.TOKEN_REQUIRED);
    }

    if (value) {
      if (typeof value !== 'string') throw new Error(AuthConstants.VALIDATION.TOKEN_STRING);
      if (value.length !== 6) throw new Error(AuthConstants.VALIDATION.TOKEN_LENGTH);
    }

    return true;
  }),

  // still validate `token` when provided (keeps clients using `token` working)
  body('token')
    .optional()
    .isString()
    .withMessage(AuthConstants.VALIDATION.TOKEN_STRING)
    .isLength({ min: 6, max: 6 })
    .withMessage(AuthConstants.VALIDATION.TOKEN_LENGTH),
];

export default verifyEmailDtoSchema;
