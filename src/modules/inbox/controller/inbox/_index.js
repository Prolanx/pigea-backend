import { ingestInboundEmailWebhook } from '@modules/inbox/controller/inbox/ingestInboundEmailWebhook.js';
import { listMessages } from '@modules/inbox/controller/inbox/listMessages.js';
import { getMessageSummary } from '@modules/inbox/controller/inbox/getMessageSummary.js';
import { getMessageById } from '@modules/inbox/controller/inbox/getMessageById.js';
import { updateMessageStatus } from '@modules/inbox/controller/inbox/updateMessageStatus.js';
import { replyToMessage } from '@modules/inbox/controller/inbox/replyToMessage.js';
import { listChannels } from '@modules/inbox/controller/inbox/listChannels.js';
import { getChannelSummary } from '@modules/inbox/controller/inbox/getChannelSummary.js';
import { connectChannel } from '@modules/inbox/controller/inbox/connectChannel.js';
import { disconnectChannel } from '@modules/inbox/controller/inbox/disconnectChannel.js';
import { updateChannelConfig } from '@modules/inbox/controller/inbox/updateChannelConfig.js';

/**
 * InboxController — business logic layer for the inbox module.
 * Receives all dependencies via constructor (DI pattern).
 */
class InboxController {
/**
   * @param {InboxDAO} inboxDAO
   * @param {AccountDAO} accountDAO - Required to resolve merchant by inbox slug
   * @param {Object} emailAdapter - Outbound email adapter
   */
  constructor(inboxDAO, accountDAO, emailAdapter) {
    this.inboxDAO = inboxDAO;
    this.accountDAO = accountDAO;
    this.emailAdapter = emailAdapter;
  }

  async ingestInboundEmailWebhook(items, traceContext = {}) {
    return ingestInboundEmailWebhook.call(this, items, traceContext);
  }

  async listMessages(merchantId, queryParams) {
    return listMessages.call(this, merchantId, queryParams);
  }

  async getMessageSummary(merchantId) {
    return getMessageSummary.call(this, merchantId);
  }

  async getMessageById(messageId, merchantId) {
    return getMessageById.call(this, messageId, merchantId);
  }

  async updateMessageStatus(messageId, merchantId, status) {
    return updateMessageStatus.call(this, messageId, merchantId, status);
  }

  async replyToMessage(messageId, merchantId, payload) {
    return replyToMessage.call(this, messageId, merchantId, payload);
  }

  async listChannels(merchantId) {
    return listChannels.call(this, merchantId);
  }

  async getChannelSummary(merchantId) {
    return getChannelSummary.call(this, merchantId);
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
}

export default InboxController;
