import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * List all inbox messages for a merchant with optional filters and pagination.
 * @param {string} merchantId
 * @param {Object} options
 * @param {string} [options.channelType]
 * @param {string} [options.status]
 * @param {Date}   [options.from]
 * @param {Date}   [options.to]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @returns {Promise<Object>} { messages, total }
 */
export async function listByMerchant(merchantId, options = {}) {
  try {
    const {
      channelType,
      status,
      from,
      to,
      page = 1,
      limit = InboxConstants.CONFIG.DEFAULT_PAGE_SIZE,
    } = options;

    const safeLimit = Math.min(Number(limit), InboxConstants.CONFIG.MAX_PAGE_SIZE);
    const safeSkip = (Math.max(Number(page), 1) - 1) * safeLimit;

    const query = { merchantId };
    if (channelType) query.channelType = channelType;
    if (status) query.status = status;
    if (from || to) {
      query.receivedAt = {};
      if (from) query.receivedAt.$gte = new Date(from);
      if (to) query.receivedAt.$lte = new Date(to);
    }

    const [messages, total] = await Promise.all([
      InboxMessage.find(query).sort({ receivedAt: -1 }).skip(safeSkip).limit(safeLimit),
      InboxMessage.countDocuments(query),
    ]);

    return { messages, total };
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.LIST_FAILED}: ${error.message}`);
  }
}
