import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { ResponseUtils } from '@common/utilities/response.js';
import inboundEmailWebhookDtoSchema from '@modules/inbox/dto/inbound-email-webhook.validation.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

/**
 * Webhook routes — public, no merchant auth required.
 * Provider (Brevo) posts here on inbound email events.
 *
 * @param {InboxController} controller
 * @returns {express.Router}
 */
function createInboxWebhookRoutes(controller) {
  const router = express.Router();

//   const isInboxDebugEnabled = process.env.NODE_ENV !== 'production';

  const logInboxWebhook = (message, details = null) => {
    // if (!isInboxDebugEnabled) return;
    if (details) {
      console.log(`[InboxWebhook][Route] ${message}`, details);
      return;
    }
    console.log(`[InboxWebhook][Route] ${message}`);
  };

  /**
   * POST /webhooks/inbound-email
   * Brevo inbound email webhook endpoint.
   * Always returns 200 after processing so Brevo does not retry endlessly.
   */
  router.post(
    '/webhooks/inbound-email',
    // validateDto(inboundEmailWebhookDtoSchema, InboxConstants.ERRORS.INGEST_FAILED),
    async (req, res) => {
      try {
        const requestId = `iw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { items } = req.body;

        console.log(`webhook request body:`, req.body);

        logInboxWebhook('Inbound webhook request received', {
          requestId,
          itemCount: Array.isArray(items) ? items.length : 0,
          contentType: req.headers['content-type'] || null,
          userAgent: req.headers['user-agent'] || null,
        });

        if (!items || items.length === 0) {
          logInboxWebhook('No webhook items found; returning success to avoid retries', {
            requestId,
          });
          return res.status(200).json(
            ResponseUtils.success(InboxConstants.SUCCESS.WEBHOOK_ACCEPTED, { ingested: 0, skipped: 0 })
          );
        }

        const result = await controller.ingestInboundEmailWebhook(items, { requestId });

        logInboxWebhook('Inbound webhook processing completed', {
          requestId,
          ingested: result?.ingested || 0,
          skipped: result?.skipped || 0,
        });

        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.WEBHOOK_ACCEPTED, result)
        );
      } catch (error) {
        // Return 200 always so Brevo does not retry — log the failure internally
        console.error('Inbox webhook error:', error);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.WEBHOOK_ACCEPTED, { ingested: 0, skipped: 0 })
        );
      }
    }
  );

  return router;
}

export default createInboxWebhookRoutes;
