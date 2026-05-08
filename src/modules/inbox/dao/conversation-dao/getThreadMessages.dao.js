import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Retrieve all messages for a given threadKey scoped to a merchant.
 * Returned in chronological order (oldest first) for thread display.
 *
 * @param {string} threadKey
 * @param {string} merchantId
 * @returns {Promise<Array>} message documents sorted by receivedAt asc
 */
export async function getThreadMessages(threadKey, merchantId) {
  try {
    return await InboxMessage.find({ threadKey, merchantId }).sort({ receivedAt: 1 });
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.LIST_FAILED}: ${error.message}`);
  }
}
