import { createMessage } from '@modules/inbox/dao/inbox-dao/createMessage.dao.js';
import { findByExternalId } from '@modules/inbox/dao/inbox-dao/findByExternalId.dao.js';
import { findById } from '@modules/inbox/dao/inbox-dao/findById.dao.js';
import { listByMerchant } from '@modules/inbox/dao/inbox-dao/listByMerchant.dao.js';
import { getSummaryByMerchant } from '@modules/inbox/dao/inbox-dao/getSummaryByMerchant.dao.js';
import { updateStatus } from '@modules/inbox/dao/inbox-dao/updateStatus.dao.js';
import { listChannelsByMerchant } from '@modules/inbox/dao/channel-dao/listChannelsByMerchant.dao.js';
import { connectChannel } from '@modules/inbox/dao/channel-dao/connectChannel.dao.js';
import { disconnectChannel } from '@modules/inbox/dao/channel-dao/disconnectChannel.dao.js';
import { updateChannelConfig } from '@modules/inbox/dao/channel-dao/updateChannelConfig.dao.js';
import {
  findOrCreateConversation,
  listConversationsByMerchant,
  findConversationById,
  resolveConversation,
  touchConversation,
  getThreadMessages,
} from '@modules/inbox/dao/conversation-dao/_index.js';

/**
 * InboxDAO — database layer for the inbox module.
 * All methods delegate to single-responsibility files.
 */
class InboxDAO {
  async createMessage(data) {
    return createMessage.call(this, data);
  }

  async findByExternalId(merchantId, externalMessageId) {
    return findByExternalId.call(this, merchantId, externalMessageId);
  }

  async findById(id, merchantId) {
    return findById.call(this, id, merchantId);
  }

  async listByMerchant(merchantId, options) {
    return listByMerchant.call(this, merchantId, options);
  }

  async getSummaryByMerchant(merchantId) {
    return getSummaryByMerchant.call(this, merchantId);
  }

  async updateStatus(id, merchantId, status) {
    return updateStatus.call(this, id, merchantId, status);
  }

  async listChannelsByMerchant(merchantId) {
    return listChannelsByMerchant.call(this, merchantId);
  }

  async connectChannel(merchantId, channelType, payload) {
    return connectChannel.call(this, merchantId, channelType, payload);
  }

  async disconnectChannel(merchantId, channelType) {
    return disconnectChannel.call(this, merchantId, channelType);
  }

  async updateChannelConfig(merchantId, channelType, payload) {
    return updateChannelConfig.call(this, merchantId, channelType, payload);
  }

  // ── Conversation methods ────────────────────────────────────────────────────

  async findOrCreateConversation(merchantId, threadKey, channelType, customerInfo) {
    return findOrCreateConversation.call(this, merchantId, threadKey, channelType, customerInfo);
  }

  async listConversationsByMerchant(merchantId, options) {
    return listConversationsByMerchant.call(this, merchantId, options);
  }

  async findConversationById(id, merchantId) {
    return findConversationById.call(this, id, merchantId);
  }

  async resolveConversation(id, merchantId) {
    return resolveConversation.call(this, id, merchantId);
  }

  async touchConversation(threadKey, merchantId, timestamp) {
    return touchConversation.call(this, threadKey, merchantId, timestamp);
  }

  async getThreadMessages(threadKey, merchantId) {
    return getThreadMessages.call(this, threadKey, merchantId);
  }
}

export default InboxDAO;
