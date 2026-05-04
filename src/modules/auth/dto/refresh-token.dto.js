import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { body } = common.utilities.validators;
const { AuthConstants } = constants;

const refreshTokenDtoSchema = [
  body('refreshToken')
    .notEmpty()
    .bail()
    .withMessage(AuthConstants.VALIDATION.REFRESH_TOKEN_REQUIRED)
    .isString()
    .withMessage(AuthConstants.VALIDATION.REFRESH_TOKEN_STRING),
];

export default refreshTokenDtoSchema;
