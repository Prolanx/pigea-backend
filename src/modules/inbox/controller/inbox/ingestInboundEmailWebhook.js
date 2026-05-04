import { ControllerError, DAOError } from '@common/errors.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

/**
 * Ingest one or more inbound email items from a Brevo webhook payload.
 * - Resolves the merchant by inboxSlug parsed from the recipient address.
 * - Skips duplicate messages (idempotency via externalMessageId).
 * - Returns a summary of ingested vs skipped items.
 *
 * @this {InboxController}
 * @param {Array} items - Raw items array from Brevo webhook body
 * @returns {Promise<Object>} { ingested, skipped }
 */
export async function ingestInboundEmailWebhook(items) {
  try {
    let ingested = 0;
    let skipped = 0;

    for (const email of items) {
      const toAddress = email.To?.[0]?.Address || email.To?.[0]?.address;
      const fromAddress = email.From?.Address || email.From?.address;
      const fromName = email.From?.Name || email.From?.name || null;

      // Extract slug from local-part of inbound address
      // e.g. johns-bakery@pigea-inbox.prolanx.co → johns-bakery
      const inboxSlug = toAddress?.split('@')[0]?.toLowerCase() || null;

      if (!inboxSlug) {
        skipped++;
        continue;
      }

      // Resolve merchant via inboxSlug
      const merchant = await this.accountDAO.findByInboxSlug(inboxSlug);
      if (!merchant) {
        // Unknown mailbox — acknowledge but do not fail the entire batch
        skipped++;
        continue;
      }

      // Build normalized message payload
      const externalMessageId = email.MessageId || email.messageId || null;

      const messageData = {
        merchantId: merchant._id,
        channelType: InboxConstants.CHANNEL.EMAIL,
        direction: InboxConstants.DIRECTION.INBOUND,
        externalMessageId,
        threadKey: email.InReplyTo || email.inReplyTo || externalMessageId,
        sender: {
          address: fromAddress || null,
          displayName: fromName,
        },
        recipients: (email.To || []).map((r) => ({
          address: r.Address || r.address,
          displayName: r.Name || r.name || null,
        })),
        subject: email.Subject || null,
        bodyText: email.RawTextBody || email.ExtractedMarkdownMessage || null,
        bodyHtml: email.RawHtmlBody || null,
        attachments: (email.Attachments || []).map((a) => ({
          filename: a.Name || a.name || null,
          url: a.DownloadToken || a.downloadToken || null,
          contentType: a.ContentType || a.contentType || null,
          size: a.ContentLength || a.contentLength || 0,
        })),
        metadata: email,
        sourceType: InboxConstants.SOURCE.WEBHOOK,
        status: InboxConstants.STATUS.UNREAD,
        receivedAt: email.SentAtDate ? new Date(email.SentAtDate) : new Date(),
      };

      const created = await this.inboxDAO.createMessage(messageData);
      if (created === null) {
        // createMessage returns null on duplicate key
        skipped++;
      } else {
        ingested++;
      }
    }

    return { ingested, skipped };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.INGEST_FAILED}: ${error.message}`);
  }
}
