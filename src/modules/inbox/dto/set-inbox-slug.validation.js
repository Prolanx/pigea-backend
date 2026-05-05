import { body } from '@common/utilities/validators.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Validates the inbox slug PATCH request body.
 * slug must be lowercase alphanumeric with internal hyphens, 3–50 characters.
 */
const setInboxSlugDtoSchema = [
  body('slug')
    .notEmpty()
    .withMessage(InboxConstants.SLUG_VALIDATION.REQUIRED)
    .bail()
    .isLength({ min: InboxConstants.CONFIG.SLUG_MIN_LENGTH })
    .withMessage(InboxConstants.SLUG_VALIDATION.MIN_LENGTH)
    .isLength({ max: InboxConstants.CONFIG.SLUG_MAX_LENGTH })
    .withMessage(InboxConstants.SLUG_VALIDATION.MAX_LENGTH)
    .matches(InboxConstants.SLUG.PATTERN)
    .withMessage(InboxConstants.SLUG_VALIDATION.PATTERN),
];

export default setInboxSlugDtoSchema;
