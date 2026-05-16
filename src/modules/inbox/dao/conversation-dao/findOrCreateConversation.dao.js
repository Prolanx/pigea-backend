import Conversation from '@database/models/Conversation.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import { generateTicketNumber } from '@modules/inbox/utils/ticket-number-generator.util.js';
import { buildEmailThreadKeyCandidates } from '@modules/inbox/utils/email-thread-key.util.js';

/**
 * Find the conversation for a given threadKey + merchantId.
 *
 * Rules:
 * - Reuse an existing OPEN conversation when one exists.
 * - Never auto-reopen resolved conversations.
 * - If only resolved conversations exist for this thread identity,
 *   start a fresh conversation with a new thread key namespace.
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
    const canonicalThreadKey = threadKeyCandidates[0] || threadKey;

    // Prefer active conversations if present.
    const existing = await Conversation.findOne({
      merchantId,
      status: InboxConstants.CONVERSATION_STATUS.OPEN,
      threadKey: { $in: threadKeyCandidates },
    }).sort({ updatedAt: -1 });

    if (existing) {
      return existing;
    }

    // Detect whether this thread identity was seen before but is now resolved.
    // In that case, start a NEW conversation instead of reopening the old one.
    const existingAnyStatus = await Conversation.findOne({
      merchantId,
      threadKey: { $in: threadKeyCandidates },
    }).sort({ updatedAt: -1 });

    const hasResolvedHistory = Boolean(existingAnyStatus);

    // No open conversation — create a new one with a fresh ticket number
    const ticketNumber = await generateTicketNumber(String(merchantId));

    const conversation = await Conversation.create({
      merchantId,
      channelType,
      threadKey: hasResolvedHistory
        ? `${canonicalThreadKey}::reopen-${Date.now()}`
        : canonicalThreadKey,
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
