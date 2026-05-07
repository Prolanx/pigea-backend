import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Compute inbox summary counters for a merchant.
 * @param {string} merchantId
 * @returns {Promise<Object>} { total, unread, read, archived }
 */
export async function getSummaryByMerchant(merchantId) {
  try {
    const [total, unread, read, archived] = await Promise.all([
      InboxMessage.countDocuments({ merchantId }),
      InboxMessage.countDocuments({ merchantId, status: InboxConstants.STATUS.UNREAD }),
      InboxMessage.countDocuments({ merchantId, status: InboxConstants.STATUS.READ }),
      InboxMessage.countDocuments({ merchantId, status: InboxConstants.STATUS.ARCHIVED }),
    ]);

    return { total, unread, read, archived };
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.COUNT_FAILED}: ${error.message}`);
  }
}
