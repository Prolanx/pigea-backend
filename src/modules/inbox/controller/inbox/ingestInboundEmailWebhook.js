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
export async function ingestInboundEmailWebhook(items, traceContext = {}) {
  try {
    const requestId = traceContext.requestId || null;
    const isInboxDebugEnabled = process.env.NODE_ENV !== 'production';
    const logIngest = (message, details = null) => {
      if (!isInboxDebugEnabled) return;
      const payload = details ? { ...details, requestId } : { requestId };
      if (details) {
        console.log(`[InboxWebhook][Controller] ${message}`, payload);
        return;
      }
      console.log(`[InboxWebhook][Controller] ${message}`, payload);
    };

    let ingested = 0;
    let skipped = 0;

    logIngest('Started inbound email batch processing', {
      itemCount: Array.isArray(items) ? items.length : 0,
    });

    for (let index = 0; index < items.length; index += 1) {
      const email = items[index];
      const toAddress = email.To?.[0]?.Address || email.To?.[0]?.address;
      const fromAddress = email.From?.Address || email.From?.address;
      const fromName = email.From?.Name || email.From?.name || null;
      const externalMessageId = email.MessageId || email.messageId || null;

      // Extract slug from local-part of inbound address
      // e.g. johns-bakery@pigea-inbox.prolanx.co → johns-bakery
      const inboxSlug = toAddress?.split('@')[0]?.toLowerCase() || null;

      logIngest('Parsed webhook item', {
        itemIndex: index,
        toAddress: toAddress || null,
        fromAddress: fromAddress || null,
        inboxSlug,
        externalMessageId,
      });

      if (!inboxSlug) {
        logIngest('Skipped item: inbox slug could not be derived from recipient address', {
          itemIndex: index,
          toAddress: toAddress || null,
          externalMessageId,
        });
        skipped++;
        continue;
      }

      // Resolve merchant via inboxSlug
      const merchant = await this.accountDAO.findByInboxSlug(inboxSlug);
      if (!merchant) {
        // Unknown mailbox — acknowledge but do not fail the entire batch
        logIngest('Skipped item: no merchant found for inbox slug', {
          itemIndex: index,
          inboxSlug,
          externalMessageId,
        });
        skipped++;
        continue;
      }

      logIngest('Merchant resolved for inbox slug', {
        itemIndex: index,
        inboxSlug,
        merchantId: String(merchant._id),
      });

      // Build normalized message payload
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

      logIngest('Attempting to persist inbound message', {
        itemIndex: index,
        merchantId: String(merchant._id),
        externalMessageId,
        subject: messageData.subject,
      });

      const created = await this.inboxDAO.createMessage(messageData);
      if (created === null) {
        // createMessage returns null on duplicate key
        logIngest('Skipped item: duplicate message detected (idempotent skip)', {
          itemIndex: index,
          merchantId: String(merchant._id),
          externalMessageId,
        });
        skipped++;
      } else {
        logIngest('Message persisted successfully', {
          itemIndex: index,
          messageId: String(created._id),
          merchantId: String(merchant._id),
          externalMessageId,
        });
        ingested++;
      }
    }

    logIngest('Completed inbound email batch processing', {
      ingested,
      skipped,
    });

    return { ingested, skipped };
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`${InboxConstants.ERRORS.INGEST_FAILED}: ${error.message}`);
  }
}
