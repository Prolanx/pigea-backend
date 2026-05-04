import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Find a single message by ID scoped to a merchant.
 * @param {string} id - InboxMessage _id
 * @param {string} merchantId
 * @returns {Promise<Object|null>}
 */
export async function findById(id, merchantId) {
  try {
    const message = await InboxMessage.findOne({ _id: id, merchantId });
    return message;
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.FIND_FAILED}: ${error.message}`);
  }
}
