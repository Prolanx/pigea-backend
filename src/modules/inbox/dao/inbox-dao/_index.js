import { createMessage } from '@modules/inbox/dao/inbox-dao/createMessage.dao.js';
import { findByExternalId } from '@modules/inbox/dao/inbox-dao/findByExternalId.dao.js';
import { findById } from '@modules/inbox/dao/inbox-dao/findById.dao.js';
import { listByMerchant } from '@modules/inbox/dao/inbox-dao/listByMerchant.dao.js';
import { updateStatus } from '@modules/inbox/dao/inbox-dao/updateStatus.dao.js';

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

  async updateStatus(id, merchantId, status) {
    return updateStatus.call(this, id, merchantId, status);
  }
}

export default InboxDAO;
