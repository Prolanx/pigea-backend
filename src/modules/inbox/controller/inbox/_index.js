import { ingestInboundEmailWebhook } from '@modules/inbox/controller/inbox/ingestInboundEmailWebhook.js';
import { listMessages } from '@modules/inbox/controller/inbox/listMessages.js';
import { getMessageById } from '@modules/inbox/controller/inbox/getMessageById.js';
import { updateMessageStatus } from '@modules/inbox/controller/inbox/updateMessageStatus.js';
import { setInboxSlug } from '@modules/inbox/controller/inbox/setInboxSlug.js';
import { getInboxSlug } from '@modules/inbox/controller/inbox/getInboxSlug.js';

/**
 * InboxController — business logic layer for the inbox module.
 * Receives all dependencies via constructor (DI pattern).
 */
class InboxController {
  /**
   * @param {InboxDAO} inboxDAO
   * @param {AccountDAO} accountDAO - Required to resolve merchant by inboxSlug
   */
  constructor(inboxDAO, accountDAO) {
    this.inboxDAO = inboxDAO;
    this.accountDAO = accountDAO;
  }

  async ingestInboundEmailWebhook(items, traceContext = {}) {
    return ingestInboundEmailWebhook.call(this, items, traceContext);
  }

  async listMessages(merchantId, queryParams) {
    return listMessages.call(this, merchantId, queryParams);
  }

  async getMessageById(messageId, merchantId) {
    return getMessageById.call(this, messageId, merchantId);
  }

  async updateMessageStatus(messageId, merchantId, status) {
    return updateMessageStatus.call(this, messageId, merchantId, status);
  }

  async setInboxSlug(merchantId, slug) {
    return setInboxSlug.call(this, merchantId, slug);
  }

  async getInboxSlug(merchantId) {
    return getInboxSlug.call(this, merchantId);
  }
}

export default InboxController;
