import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * List inbox messages for a merchant with filtering and pagination.
 *
 * @this {InboxController}
 * @param {string} merchantId
 * @param {Object} queryParams - { channelType, status, from, to, page, limit }
 * @returns {Promise<Object>} { messages, total, page, limit }
 */
export async function listMessages(merchantId, queryParams = {}) {
  try {
    const { messages, total } = await this.inboxDAO.listByMerchant(merchantId, queryParams);

    const page = Math.max(Number(queryParams.page || 1), 1);
    const limit = Math.min(
      Number(queryParams.limit || InboxConstants.CONFIG.DEFAULT_PAGE_SIZE),
      InboxConstants.CONFIG.MAX_PAGE_SIZE
    );

    return {
      messages: messages.map(formatMessage),
      total,
      page,
      limit,
    };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.LIST_FAILED}: ${error.message}`);
  }
}

function formatMessage(msg) {
  return {
    id: msg._id,
    channelType: msg.channelType,
    direction: msg.direction,
    sender: msg.sender,
    recipients: msg.recipients,
    subject: msg.subject,
    bodyText: msg.bodyText,
    status: msg.status,
    threadKey: msg.threadKey,
    receivedAt: msg.receivedAt,
    createdAt: msg.createdAt,
  };
}
