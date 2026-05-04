import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Create a new inbox message record.
 * @param {Object} data - Normalized InboxMessage data
 * @returns {Promise<Object>} Created document
 */
export async function createMessage(data) {
  try {
    const message = await InboxMessage.create(data);
    return message;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate externalMessageId — caller should treat this as idempotent skip
      return null;
    }
    throw new DAOError(`${InboxConstants.DB_ERRORS.CREATE_FAILED}: ${error.message}`);
  }
}
