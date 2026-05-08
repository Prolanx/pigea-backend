import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Get all messages in a conversation thread.
 *
 * @this {InboxController}
 * @param {string} conversationId
 * @param {string} merchantId
 * @returns {Promise<Object>} { conversation, messages }
 */
export async function getConversationThread(conversationId, merchantId) {
  try {
    const conversation = await this.inboxDAO.findConversationById(conversationId, merchantId);
    if (!conversation) {
      throw new ControllerError(InboxConstants.ERRORS.CONVERSATION_NOT_FOUND, 404);
    }

    const messages = await this.inboxDAO.getThreadMessages(conversation.threadKey, merchantId);

    return {
      conversation: {
        id: conversation._id,
        ticketNumber: conversation.ticketNumber,
        channelType: conversation.channelType,
        threadKey: conversation.threadKey,
        status: conversation.status,
        customerAddress: conversation.customerAddress,
        customerName: conversation.customerName,
        lastMessageAt: conversation.lastMessageAt,
        resolvedAt: conversation.resolvedAt,
        createdAt: conversation.createdAt,
      },
      messages: messages.map((msg) => ({
        id: msg._id,
        channelType: msg.channelType,
        direction: msg.direction,
        sender: msg.sender,
        recipients: msg.recipients,
        subject: msg.subject,
        bodyText: msg.bodyText,
        bodyHtml: msg.bodyHtml,
        attachments: msg.attachments,
        status: msg.status,
        receivedAt: msg.receivedAt,
        createdAt: msg.createdAt,
      })),
    };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) throw error;
    throw new ControllerError(`${InboxConstants.ERRORS.THREAD_GET_FAILED}: ${error.message}`);
  }
}
