import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import { normalizeEmailThreadKey } from '@modules/inbox/utils/email-thread-key.util.js';

function renderReplyBody(templateText, { companyName, customerName }) {
  return String(templateText || '')
    .replace(/\{\{company_name\}\}/g, companyName)
    .replace(/\{\{customer_name\}\}/g, customerName);
}

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
    console.log('[replyToMessage] ENTRY', { messageId, merchantId, payload });
    const original = await this.inboxDAO.findById(messageId, merchantId);
    if (!original) {
      console.error('[replyToMessage] Original message not found', { messageId, merchantId });
      throw new ControllerError(InboxConstants.ERRORS.MESSAGE_NOT_FOUND, 404);
    }

    if (original.channelType !== InboxConstants.CHANNEL.EMAIL) {
      console.error('[replyToMessage] Not an email channel', { channelType: original.channelType });
      throw new ControllerError(InboxConstants.ERRORS.REPLY_ONLY_EMAIL, 400);
    }

    const recipientEmail = original.sender?.address || null;
    if (!recipientEmail) {
      console.error('[replyToMessage] No recipient email found', { original });
      throw new ControllerError(InboxConstants.ERRORS.REPLY_EMAIL_REQUIRED, 400);
    }

    const merchant = await this.accountDAO.findById(merchantId);
    if (!merchant) {
      console.error('[replyToMessage] Merchant not found', { merchantId });
      throw new ControllerError(InboxConstants.ERRORS.REPLY_MERCHANT_NOT_FOUND, 404);
    }

    const subjectBase = String(payload.subject || original.subject || '').trim();
    const subject = subjectBase.toLowerCase().startsWith('re:')
      ? subjectBase
      : `Re: ${subjectBase || 'Message'}`;

    const merchantBusinessName = String(merchant.businessInfo?.name || '').trim();
    const merchantFromName = merchantBusinessName || merchant.email || 'Merchant';

    const emailChannelAddress = String(
      original.recipients?.find((recipient) => recipient?.address)?.address || ''
    ).trim() || null;

    if (!emailChannelAddress) {
      console.error('[replyToMessage] No merchant inbox address found', { original });
      throw new ControllerError(
        'Email reply cannot be sent because the merchant inbox address could not be resolved.',
        400,
      );
    }

    const companyName = merchantBusinessName || merchantFromName;
    const customerName =
      String(original.sender?.displayName || '').trim() ||
      String(original.sender?.address || '').trim() ||
      'Customer';

    const bodyText = renderReplyBody(payload.bodyText, {
      companyName,
      customerName,
    }).trim();
    const bodyHtml = bodyText.replace(/\n/g, '<br>');

    // Log before sending email
    console.log('[replyToMessage] SENDING EMAIL', {
      to: recipientEmail,
      subject,
      replyTo: emailChannelAddress,
      from: `"${merchantFromName}" <${emailChannelAddress}>`,
    });

    const sendResult = await this.emailAdapter.sendEmail({
      to: recipientEmail,
      subject,
      text: bodyText,
      html: bodyHtml,
      replyTo: emailChannelAddress,
      from: `"${merchantFromName}" <${emailChannelAddress}>`,
    });

    // Capture the provider-assigned Message-ID so customer replies can be
    // threaded back to this conversation via the InReplyTo webhook field.
    const outboundMessageId = normalizeEmailThreadKey(sendResult?.messageId || null);

    const templateMetadata = payload.template || {};

    const created = await this.inboxDAO.createMessage({
      merchantId,
      channelType: InboxConstants.CHANNEL.EMAIL,
      direction: InboxConstants.DIRECTION.OUTBOUND,
      externalMessageId: outboundMessageId || null,
      threadKey: original.threadKey || original.externalMessageId || null,
      sender: {
        address: emailChannelAddress,
        displayName: merchantFromName,
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
      template: {
        id: templateMetadata.id || null,
        name: templateMetadata.name || null,
        originalContent: templateMetadata.originalContent || null,
        resolvedVariables: templateMetadata.resolvedVariables || {},
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

    console.log('[replyToMessage] SUCCESS', { messageId, merchantId, replyId: created?._id });
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
    console.error('[replyToMessage] ERROR', { error: error?.message, stack: error?.stack });
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }

    if (error?.name === 'EmailTransportError') {
      const statusCode = Number(error?.statusCode || 502);
      const message = error?.isTimeout
        ? 'Reply could not be sent right now because the email server timed out. Please try again.'
        : 'Reply could not be sent because the email service is temporarily unavailable. Please try again.';
      throw new ControllerError(message, statusCode);
    }

    throw new ControllerError(`${InboxConstants.ERRORS.REPLY_FAILED}: ${error.message}`);
  }
}
