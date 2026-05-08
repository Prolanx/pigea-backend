import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * List conversations for a merchant (left panel data source).
 *
 * @this {InboxController}
 * @param {string} merchantId
 * @param {Object} queryParams - { status, channelType }
 * @returns {Promise<Array>}
 */
export async function listConversations(merchantId, queryParams = {}) {
  try {
    const conversations = await this.inboxDAO.listConversationsByMerchant(merchantId, queryParams);
    return conversations.map(formatConversation);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) throw error;
    throw new ControllerError(`${InboxConstants.ERRORS.CONVERSATION_LIST_FAILED}: ${error.message}`);
  }
}

function formatConversation(c) {
  return {
    id: c._id,
    ticketNumber: c.ticketNumber,
    channelType: c.channelType,
    threadKey: c.threadKey,
    status: c.status,
    assigneeId: c.assigneeId,
    customerAddress: c.customerAddress,
    customerName: c.customerName,
    lastMessageAt: c.lastMessageAt,
    lastMessagePreview: c.lastMessagePreview,
    lastMessageDirection: c.lastMessageDirection,
    unreadCount: c.unreadCount,
    resolvedAt: c.resolvedAt,
    createdAt: c.createdAt,
  };
}
