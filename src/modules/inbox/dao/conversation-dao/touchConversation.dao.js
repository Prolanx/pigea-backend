import Conversation from '@database/models/Conversation.js';
import { DAOError } from '@common/errors.js';
import { buildEmailThreadKeyCandidates } from '@modules/inbox/utils/email-thread-key.util.js';

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
    const threadKeyCandidates = buildEmailThreadKeyCandidates(threadKey);

    await Conversation.updateOne(
      { merchantId, threadKey: { $in: threadKeyCandidates } },
      { lastMessageAt: timestamp },
    );
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.CONVERSATION_UPDATE_FAILED}: ${error.message}`);
  }
}
