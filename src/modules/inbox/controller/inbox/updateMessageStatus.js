import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Update the read/archive status of a message.
 *
 * @this {InboxController}
 * @param {string} messageId
 * @param {string} merchantId
 * @param {string} status - Must be one of InboxConstants.STATUS values
 * @returns {Promise<Object>} Updated message
 */
export async function updateMessageStatus(messageId, merchantId, status) {
  try {
    const allowed = Object.values(InboxConstants.STATUS);
    if (!allowed.includes(status)) {
      throw new ControllerError(InboxConstants.ERRORS.INVALID_STATUS, 400);
    }

    const message = await this.inboxDAO.updateStatus(messageId, merchantId, status);
    if (!message) {
      throw new ControllerError(InboxConstants.ERRORS.MESSAGE_NOT_FOUND, 404);
    }

    return {
      id: message._id,
      status: message.status,
      updatedAt: message.updatedAt,
    };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.STATUS_UPDATE_FAILED}: ${error.message}`);
  }
}
