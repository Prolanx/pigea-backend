import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Find a message by provider-assigned external ID within a merchant scope.
 * Used for idempotency checks on webhook ingestion.
 * @param {string} merchantId
 * @param {string} externalMessageId
 * @returns {Promise<Object|null>}
 */
export async function findByExternalId(merchantId, externalMessageId) {
  try {
    const message = await InboxMessage.findOne({ merchantId, externalMessageId });
    return message;
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.FIND_BY_EXTERNAL_ID_FAILED}: ${error.message}`);
  }
}
