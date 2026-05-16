import Conversation from '@database/models/Conversation.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Toggle a conversation between open and resolved.
 *
 * @param {string} id - Conversation _id
 * @param {string} merchantId
 * @returns {Promise<Object|null>} Updated document or null if not found
 */
export async function resolveConversation(id, merchantId) {
  try {
    const conversation = await Conversation.findOne({ _id: id, merchantId });
    if (!conversation) return null;

    if (conversation.status === InboxConstants.CONVERSATION_STATUS.RESOLVED) {
      conversation.status = InboxConstants.CONVERSATION_STATUS.OPEN;
      conversation.resolvedAt = null;
    } else {
      conversation.status = InboxConstants.CONVERSATION_STATUS.RESOLVED;
      conversation.resolvedAt = new Date();
    }

    await conversation.save();
    return conversation;
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.CONVERSATION_UPDATE_FAILED}: ${error.message}`);
  }
}
