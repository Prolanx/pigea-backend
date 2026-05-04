import { query } from '@common/utilities/validators.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Validates query params for listing inbox messages.
 * All fields are optional — pagination, channel, status, and date range filters.
 */
const listMessagesDtoSchema = [
  query('channelType')
    .optional()
    .isIn(Object.values(InboxConstants.CHANNEL))
    .withMessage(InboxConstants.VALIDATION.CHANNEL_INVALID),

  query('status')
    .optional()
    .isIn(Object.values(InboxConstants.STATUS))
    .withMessage(InboxConstants.VALIDATION.STATUS_INVALID),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: InboxConstants.CONFIG.MAX_PAGE_SIZE })
    .toInt(),

  query('from')
    .optional()
    .isISO8601()
    .withMessage('from must be a valid ISO 8601 date'),

  query('to')
    .optional()
    .isISO8601()
    .withMessage('to must be a valid ISO 8601 date'),
];

export default listMessagesDtoSchema;
