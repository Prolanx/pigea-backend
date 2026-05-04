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

  /**
   * POST /webhooks/inbound-email
   * Brevo inbound email webhook endpoint.
   * Always returns 200 after processing so Brevo does not retry endlessly.
   */
  router.post(
    '/webhooks/inbound-email',
    validateDto(inboundEmailWebhookDtoSchema, InboxConstants.ERRORS.INGEST_FAILED),
    async (req, res) => {
      try {
        const { items } = req.body;

        if (!items || items.length === 0) {
          return res.status(200).json(
            ResponseUtils.success(InboxConstants.SUCCESS.WEBHOOK_ACCEPTED, { ingested: 0, skipped: 0 })
          );
        }

        const result = await controller.ingestInboundEmailWebhook(items);

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
