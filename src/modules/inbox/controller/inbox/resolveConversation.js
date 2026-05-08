import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Resolve a conversation — closes the ticket.
 * Emits a real-time event to the merchant's socket room.
 *
 * @this {InboxController}
 * @param {string} conversationId
 * @param {string} merchantId
 * @returns {Promise<Object>} resolved conversation summary
 */
export async function resolveConversation(conversationId, merchantId) {
  try {
    const conversation = await this.inboxDAO.findConversationById(conversationId, merchantId);
    if (!conversation) {
      throw new ControllerError(InboxConstants.ERRORS.CONVERSATION_NOT_FOUND, 404);
    }

    if (conversation.status === InboxConstants.CONVERSATION_STATUS.RESOLVED) {
      throw new ControllerError(InboxConstants.ERRORS.CONVERSATION_ALREADY_RESOLVED, 400);
    }

    const resolved = await this.inboxDAO.resolveConversation(conversationId, merchantId);

    // Emit real-time event
    if (this.socketAdapter) {
      this.socketAdapter.emit(`merchant:${String(merchantId)}`, 'conversation_resolved', {
        conversationId: String(resolved._id),
        ticketNumber: resolved.ticketNumber,
        threadKey: resolved.threadKey,
        resolvedAt: resolved.resolvedAt,
      });
    }

    return {
      id: resolved._id,
      ticketNumber: resolved.ticketNumber,
      status: resolved.status,
      resolvedAt: resolved.resolvedAt,
    };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) throw error;
    throw new ControllerError(`${InboxConstants.ERRORS.CONVERSATION_RESOLVE_FAILED}: ${error.message}`);
  }
}
