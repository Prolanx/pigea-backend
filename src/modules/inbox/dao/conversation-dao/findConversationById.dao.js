import Conversation from '@database/models/Conversation.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Find a single conversation by its _id scoped to the merchant.
 *
 * @param {string} id - Conversation _id
 * @param {string} merchantId
 * @returns {Promise<Object|null>}
 */
export async function findConversationById(id, merchantId) {
  try {
    return await Conversation.findOne({ _id: id, merchantId });
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.CONVERSATION_FIND_FAILED}: ${error.message}`);
  }
}
