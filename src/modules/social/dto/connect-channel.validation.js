import { body } from '@common/validators.js';

/**
 * Validation for connecting a social channel
 */
const connectChannelDtoSchema = [
  body('provider')
    .notEmpty()
    .withMessage('Provider is required')
    .isString()
    .withMessage('Provider must be a string')
    .trim(),

  body('accessToken')
    .notEmpty()
    .withMessage('Access token is required')
    .isString()
    .withMessage('Access token must be a string'),

  body('refreshToken')
    .optional()
    .isString()
    .withMessage('Refresh token must be a string'),

  body('channelId')
    .optional()
    .isString()
    .withMessage('Channel ID must be a string')
];

export default connectChannelDtoSchema;
