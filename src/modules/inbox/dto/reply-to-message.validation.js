import { body } from '@common/utilities/validators.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Validates reply payload for replying to an inbox message.
 */
const replyToMessageDtoSchema = [
  body('bodyText')
    .notEmpty()
    .bail()
    .withMessage(InboxConstants.VALIDATION.REPLY_BODY_REQUIRED)
    .isString()
    .withMessage(InboxConstants.VALIDATION.REPLY_BODY_MUST_BE_STRING)
    .trim(),

  body('subject')
    .optional()
    .isString()
    .trim(),
];

export default replyToMessageDtoSchema;
