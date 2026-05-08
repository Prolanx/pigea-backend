import Conversation from '@database/models/Conversation.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import { generateTicketNumber } from '@modules/inbox/utils/ticket-number-generator.util.js';

/**
 * Find an open conversation for a given threadKey + merchantId.
 * If none exists, create a new one with an auto-generated ticket number.
 *
 * @param {string} merchantId
 * @param {string} threadKey
 * @param {string} channelType
 * @param {Object} customerInfo - { address, displayName }
 * @returns {Promise<Object>} The found or newly created conversation document
 */
export async function findOrCreateConversation(merchantId, threadKey, channelType, customerInfo = {}) {
  try {
    // Look for an existing open conversation for this thread
    const existing = await Conversation.findOne({
      merchantId,
      threadKey,
      status: InboxConstants.CONVERSATION_STATUS.OPEN,
    });

    if (existing) {
      return existing;
    }

    // No open conversation — create a new one with a fresh ticket number
    const ticketNumber = await generateTicketNumber(String(merchantId));

    const conversation = await Conversation.create({
      merchantId,
      channelType,
      threadKey,
      ticketNumber,
      status: InboxConstants.CONVERSATION_STATUS.OPEN,
      lastMessageAt: new Date(),
      customerAddress: customerInfo.address || null,
      customerName: customerInfo.displayName || null,
    });

    return conversation;
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.CONVERSATION_CREATE_FAILED}: ${error.message}`);
  }
}
