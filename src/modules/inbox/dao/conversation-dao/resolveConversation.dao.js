import Conversation from '@database/models/Conversation.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Resolve a conversation — sets status to 'resolved' and records resolvedAt.
 *
 * @param {string} id - Conversation _id
 * @param {string} merchantId
 * @returns {Promise<Object|null>} Updated document or null if not found
 */
export async function resolveConversation(id, merchantId) {
  try {
    return await Conversation.findOneAndUpdate(
      { _id: id, merchantId },
      {
        status: InboxConstants.CONVERSATION_STATUS.RESOLVED,
        resolvedAt: new Date(),
      },
      { new: true, runValidators: true },
    );
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.CONVERSATION_UPDATE_FAILED}: ${error.message}`);
  }
}
