import { body } from '@common/utilities/validators.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Validates the inbound email webhook body from Brevo.
 * Expects: { items: [...] }
 */
const inboundEmailWebhookDtoSchema = [
  body('items')
    .notEmpty()
    .bail()
    .withMessage(InboxConstants.VALIDATION.ITEMS_REQUIRED)
    .isArray()
    .withMessage(InboxConstants.VALIDATION.ITEMS_MUST_BE_ARRAY),
];

export default inboundEmailWebhookDtoSchema;
