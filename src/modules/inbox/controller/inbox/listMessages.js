import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * List inbox messages for a merchant with optional filters.
 *
 * @this {InboxController}
 * @param {string} merchantId
 * @param {Object} queryParams - { channelType, status, from, to }
 * @returns {Promise<Array>} formatted inbox messages
 */
export async function listMessages(merchantId, queryParams = {}) {
  try {
    const messages = await this.inboxDAO.listByMerchant(merchantId, queryParams);
    return messages.map(formatMessage);
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
