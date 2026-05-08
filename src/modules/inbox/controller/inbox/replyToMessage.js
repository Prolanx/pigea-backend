import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Send an outbound email reply for an inbox message and persist it in inbox history.
 *
 * @this {InboxController}
 * @param {string} messageId
 * @param {string} merchantId
 * @param {Object} payload
 * @param {string} payload.bodyText
 * @param {string} [payload.subject]
 * @returns {Promise<Object>} persisted outbound reply summary
 */
export async function replyToMessage(messageId, merchantId, payload = {}) {
  try {
    const original = await this.inboxDAO.findById(messageId, merchantId);
    if (!original) {
      throw new ControllerError(InboxConstants.ERRORS.MESSAGE_NOT_FOUND, 404);
    }

    if (original.channelType !== InboxConstants.CHANNEL.EMAIL) {
      throw new ControllerError(InboxConstants.ERRORS.REPLY_ONLY_EMAIL, 400);
    }

    const recipientEmail = original.sender?.address || null;
    if (!recipientEmail) {
      throw new ControllerError(InboxConstants.ERRORS.REPLY_EMAIL_REQUIRED, 400);
    }

    const merchant = await this.accountDAO.findById(merchantId);
    if (!merchant) {
      throw new ControllerError(InboxConstants.ERRORS.REPLY_MERCHANT_NOT_FOUND, 404);
    }

    const bodyText = String(payload.bodyText || '').trim();
    const subjectBase = String(payload.subject || original.subject || '').trim();
    const subject = subjectBase.toLowerCase().startsWith('re:')
      ? subjectBase
      : `Re: ${subjectBase || 'Message'}`;

    const merchantDisplayName =
      `${merchant.firstName || ''} ${merchant.lastName || ''}`.trim() ||
      merchant.businessInfo?.name ||
      merchant.email ||
      'Merchant';

    const bodyHtml = bodyText.replace(/\n/g, '<br>');

    await this.emailAdapter.sendEmail({
      to: recipientEmail,
      subject,
      text: bodyText,
      html: bodyHtml,
      replyTo: merchant.email || undefined,
      fromName: merchantDisplayName,
    });

    const created = await this.inboxDAO.createMessage({
      merchantId,
      channelType: InboxConstants.CHANNEL.EMAIL,
      direction: InboxConstants.DIRECTION.OUTBOUND,
      externalMessageId: null,
      threadKey: original.threadKey || original.externalMessageId || null,
      sender: {
        address: merchant.email || null,
        displayName: merchantDisplayName,
      },
      recipients: [
        {
          address: recipientEmail,
          displayName: original.sender?.displayName || null,
        },
      ],
      subject,
      bodyText,
      bodyHtml,
      attachments: [],
      metadata: {
        type: 'merchant_reply',
        replyToMessageId: String(original._id),
      },
      sourceType: InboxConstants.SOURCE.MANUAL,
      status: InboxConstants.STATUS.READ,
      receivedAt: new Date(),
    });

    // Replying marks the original inbound message as read.
    if (original.status === InboxConstants.STATUS.UNREAD) {
      await this.inboxDAO.updateStatus(messageId, merchantId, InboxConstants.STATUS.READ);
    }

    // Update the conversation's lastMessageAt timestamp
    if (created?.threadKey) {
      await this.inboxDAO.touchConversation(created.threadKey, merchantId, created.receivedAt);
    }

    return {
      id: created?._id,
      threadKey: created?.threadKey,
      direction: created?.direction,
      channelType: created?.channelType,
      subject: created?.subject,
      bodyText: created?.bodyText,
      status: created?.status,
      sentAt: created?.createdAt,
    };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.REPLY_FAILED}: ${error.message}`);
  }
}
