import InboxMessage from '@database/models/InboxMessage.js';
import { DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Update the status of a message scoped to a merchant.
 * @param {string} id - InboxMessage _id
 * @param {string} merchantId
 * @param {string} status - New status value
 * @returns {Promise<Object|null>} Updated document or null if not found
 */
export async function updateStatus(id, merchantId, status) {
  try {
    const message = await InboxMessage.findOneAndUpdate(
      { _id: id, merchantId },
      { status },
      { new: true, runValidators: true }
    );
    return message;
  } catch (error) {
    throw new DAOError(`${InboxConstants.DB_ERRORS.UPDATE_FAILED}: ${error.message}`);
  }
}
