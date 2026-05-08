import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { ResponseUtils } from '@common/utilities/response.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

/**
 * @param {InboxController} controller
 * @returns {express.Router}
 */
function createInboxConversationRoutes(controller) {
  const router = express.Router();

  /**
   * GET /
   * List conversations (tickets) for the authenticated merchant.
   * Supports filters: status (open|resolved), channelType.
   */
  router.get(
    '/',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const result = await controller.listConversations(req.user.accountId, req.query);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.CONVERSATIONS_RETRIEVED, result)
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.CONVERSATION_LIST_FAILED), null)
        );
      }
    }
  );

  /**
   * GET /:id/thread
   * Get the full message thread for a conversation.
   */
  router.get(
    '/:id/thread',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const result = await controller.getConversationThread(req.params.id, req.user.accountId);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.THREAD_RETRIEVED, result)
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.THREAD_GET_FAILED), null)
        );
      }
    }
  );

  /**
   * PATCH /:id/resolve
   * Resolve (close) a conversation.
   */
  router.patch(
    '/:id/resolve',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const result = await controller.resolveConversation(req.params.id, req.user.accountId);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.CONVERSATION_RESOLVED, result)
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.CONVERSATION_RESOLVE_FAILED), null)
        );
      }
    }
  );

  return router;
}

export default createInboxConversationRoutes;
