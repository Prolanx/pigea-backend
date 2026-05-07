import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * List all inbox messages for a merchant with optional filters.
 * @param {string} merchantId
 * @param {Object} options
 * @param {string} [options.channelType]
 * @param {string} [options.status]
 * @param {Date}   [options.from]
 * @param {Date}   [options.to]
 * @returns {Promise<Array>} message documents
 */
export async function listByMerchant(merchantId, options = {}) {
  try {
    const {
      channelType,
      status,
      from,
      to,
    } = options;

    const query = { merchantId };
    if (channelType) query.channelType = channelType;
    if (status) query.status = status;
    if (from || to) {
      query.receivedAt = {};
      if (from) query.receivedAt.$gte = new Date(from);
      if (to) query.receivedAt.$lte = new Date(to);
    }

    const messages = await InboxMessage.find(query).sort({ receivedAt: -1 });
    return messages;
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.LIST_FAILED}: ${error.message}`);
  }
}
