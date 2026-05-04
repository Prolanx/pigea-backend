import { body } from '@common/utilities/validators.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Validates status update request body.
 */
const updateMessageStatusDtoSchema = [
  body('status')
    .notEmpty()
    .bail()
    .withMessage(InboxConstants.VALIDATION.STATUS_REQUIRED)
    .isIn(Object.values(InboxConstants.STATUS))
    .withMessage(InboxConstants.VALIDATION.STATUS_INVALID),
];

export default updateMessageStatusDtoSchema;
