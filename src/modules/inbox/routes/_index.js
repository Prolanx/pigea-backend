import express from 'express';
import createInboxWebhookRoutes from '@modules/inbox/routes/webhook.routes.js';
import createInboxMessageRoutes from '@modules/inbox/routes/message.routes.js';

/**
 * Main Inbox route factory.
 * Combines webhook (public) and message management (authenticated) routes.
 *
 * @param {InboxController} controller
 * @returns {express.Router}
 */
function createInboxRoutes(controller) {
  const router = express.Router();

  // Public: provider webhook ingestion
  router.use('/', createInboxWebhookRoutes(controller));

  // Authenticated: merchant message management
  router.use('/messages', createInboxMessageRoutes(controller));

  return router;
}

export default createInboxRoutes;
