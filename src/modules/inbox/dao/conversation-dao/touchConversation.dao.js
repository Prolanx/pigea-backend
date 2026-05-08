import Conversation from '@database/models/Conversation.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Update the lastMessageAt timestamp on a conversation.
 * Called after each new message is added to the thread.
 *
 * @param {string} threadKey
 * @param {string} merchantId
 * @param {Date} timestamp
 * @returns {Promise<void>}
 */
export async function touchConversation(threadKey, merchantId, timestamp = new Date()) {
  try {
    await Conversation.updateOne(
      { threadKey, merchantId, status: InboxConstants.CONVERSATION_STATUS.OPEN },
      { lastMessageAt: timestamp },
    );
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.CONVERSATION_UPDATE_FAILED}: ${error.message}`);
  }
}
