import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Toggle a conversation status (open <-> resolved).
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

    const resolved = await this.inboxDAO.resolveConversation(conversationId, merchantId);

    // Emit real-time event
    if (this.socketAdapter) {
      this.socketAdapter.emit(`merchant:${String(merchantId)}`, 'conversation_resolved', {
        conversationId: String(resolved._id),
        ticketNumber: resolved.ticketNumber,
        threadKey: resolved.threadKey,
        status: resolved.status,
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
