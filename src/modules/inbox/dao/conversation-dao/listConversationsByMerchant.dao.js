import Conversation from '@database/models/Conversation.js';
import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * List conversations for a merchant, one per thread, sorted by most recent message.
 * Each conversation is enriched with an unread message count.
 *
 * @param {string} merchantId
 * @param {Object} options
 * @param {string} [options.status] - 'open' | 'resolved' — defaults to 'open'
 * @param {string} [options.channelType]
 * @returns {Promise<Array>} enriched conversation documents
 */
export async function listConversationsByMerchant(merchantId, options = {}) {
  try {
    const { status = InboxConstants.CONVERSATION_STATUS.OPEN, channelType } = options;

    const query = { merchantId };
    if (status) query.status = status;
    if (channelType) query.channelType = channelType;

    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 });

    if (!conversations.length) return [];

    // Batch-fetch unread counts for all conversations in one query
    const threadKeys = conversations.map((c) => c.threadKey);
    const unreadCounts = await InboxMessage.aggregate([
      {
        $match: {
          merchantId: conversations[0].merchantId,
          threadKey: { $in: threadKeys },
          status: InboxConstants.STATUS.UNREAD,
        },
      },
      { $group: { _id: '$threadKey', count: { $sum: 1 } } },
    ]);

    const unreadMap = {};
    for (const row of unreadCounts) {
      unreadMap[row._id] = row.count;
    }

    // Fetch last message body preview for each thread
    const lastMessages = await InboxMessage.aggregate([
      {
        $match: {
          merchantId: conversations[0].merchantId,
          threadKey: { $in: threadKeys },
        },
      },
      { $sort: { receivedAt: -1 } },
      {
        $group: {
          _id: '$threadKey',
          lastBodyText: { $first: '$bodyText' },
          lastSubject: { $first: '$subject' },
          lastDirection: { $first: '$direction' },
          lastReceivedAt: { $first: '$receivedAt' },
        },
      },
    ]);

    const lastMessageMap = {};
    for (const row of lastMessages) {
      lastMessageMap[row._id] = row;
    }

    return conversations.map((c) => {
      const lm = lastMessageMap[c.threadKey] || {};
      return {
        ...c.toObject(),
        unreadCount: unreadMap[c.threadKey] || 0,
        lastMessagePreview: lm.lastBodyText || lm.lastSubject || null,
        lastMessageDirection: lm.lastDirection || null,
        lastMessageAt: lm.lastReceivedAt || c.lastMessageAt,
      };
    });
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.CONVERSATION_LIST_FAILED}: ${error.message}`);
  }
}
