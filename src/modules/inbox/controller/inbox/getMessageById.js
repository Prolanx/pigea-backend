import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Retrieve the full detail of a single inbox message.
 *
 * @this {InboxController}
 * @param {string} messageId
 * @param {string} merchantId
 * @returns {Promise<Object>} Full message document
 */
export async function getMessageById(messageId, merchantId) {
  try {
    const message = await this.inboxDAO.findById(messageId, merchantId);
    if (!message) {
      throw new ControllerError(InboxConstants.ERRORS.MESSAGE_NOT_FOUND, 404);
    }

    return {
      id: message._id,
      channelType: message.channelType,
      direction: message.direction,
      externalMessageId: message.externalMessageId,
      threadKey: message.threadKey,
      sender: message.sender,
      recipients: message.recipients,
      subject: message.subject,
      bodyText: message.bodyText,
      bodyHtml: message.bodyHtml,
      attachments: message.attachments,
      status: message.status,
      sourceType: message.sourceType,
      receivedAt: message.receivedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.GET_FAILED}: ${error.message}`);
  }
}
