import Conversation from '@database/models/Conversation.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import { generateTicketNumber } from '@modules/inbox/utils/ticket-number-generator.util.js';
import { buildEmailThreadKeyCandidates } from '@modules/inbox/utils/email-thread-key.util.js';

/**
 * Find the conversation for a given threadKey + merchantId.
 *
 * Rules:
 * - Prefer an existing open conversation when one exists.
 * - Otherwise reuse any existing conversation for the same thread.
 * - Never auto-change conversation status here.
 * - Create a new conversation only if none exists for the thread.
 *
 * @param {string} merchantId
 * @param {string} threadKey
 * @param {string} channelType
 * @param {Object} customerInfo - { address, displayName }
 * @returns {Promise<Object>} The found or newly created conversation document
 */
export async function findOrCreateConversation(merchantId, threadKey, channelType, customerInfo = {}) {
  try {
    const threadKeyCandidates = buildEmailThreadKeyCandidates(threadKey);

    // Prefer active conversations if present.
    const existing = await Conversation.findOne({
      merchantId,
      status: InboxConstants.CONVERSATION_STATUS.OPEN,
      threadKey: { $in: threadKeyCandidates },
    }).sort({ updatedAt: -1 });

    if (existing) {
      return existing;
    }

    // Reuse any existing conversation for this thread.
    // If the conversation was resolved, reopen it — a new inbound message
    // from the customer means the issue needs attention again.
    const existingAnyStatus = await Conversation.findOne({
      merchantId,
      threadKey: { $in: threadKeyCandidates },
    }).sort({ updatedAt: -1 });

    if (existingAnyStatus) {
      if (existingAnyStatus.status === InboxConstants.CONVERSATION_STATUS.RESOLVED) {
        existingAnyStatus.status = InboxConstants.CONVERSATION_STATUS.OPEN;
        existingAnyStatus.resolvedAt = null;
        await existingAnyStatus.save();
      }
      return existingAnyStatus;
    }

    // No open conversation — create a new one with a fresh ticket number
    const ticketNumber = await generateTicketNumber(String(merchantId));

    const conversation = await Conversation.create({
      merchantId,
      channelType,
      threadKey: threadKeyCandidates[0] || threadKey,
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
