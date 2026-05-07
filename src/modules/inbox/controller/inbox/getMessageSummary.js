import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Get summary counters for inbox messages.
 *
 * @this {InboxController}
 * @param {string} merchantId
 * @returns {Promise<Object>} { total, unread, read, archived }
 */
export async function getMessageSummary(merchantId) {
  try {
    return await this.inboxDAO.getSummaryByMerchant(merchantId);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.LIST_FAILED}: ${error.message}`);
  }
}
