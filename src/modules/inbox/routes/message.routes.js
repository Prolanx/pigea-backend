import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import { ResponseUtils } from '@common/utilities/response.js';
import listMessagesDtoSchema from '@modules/inbox/dto/list-messages.validation.js';
import updateMessageStatusDtoSchema from '@modules/inbox/dto/update-message-status.validation.js';
import replyToMessageDtoSchema from '@modules/inbox/dto/reply-to-message.validation.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

/**
 * @param {InboxController} controller
 * @returns {express.Router}
 */
function createInboxMessageRoutes(controller) {
  const router = express.Router();

  /**
   * GET /
   * List inbox messages for the authenticated merchant.
   * Supports filters: channelType, status, from, to, page, limit.
   */
  router.get(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(listMessagesDtoSchema, InboxConstants.ERRORS.LIST_FAILED),
    async (req, res) => {
      try {
        const result = await controller.listMessages(req.user.accountId, req.query);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.MESSAGES_RETRIEVED, result)
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.LIST_FAILED), null)
        );
      }
    }
  );

  /**
   * GET /summary
   * Get inbox counters for the authenticated merchant.
   */
  router.get(
    '/summary',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const summary = await controller.getMessageSummary(req.user.accountId);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.SUMMARY_RETRIEVED, summary)
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.LIST_FAILED), null)
        );
      }
    }
  );

  /**
   * GET /:id
   * Get full detail of a single inbox message.
   */
  router.get(
    '/:id',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const message = await controller.getMessageById(req.params.id, req.user.accountId);
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.MESSAGE_RETRIEVED, message)
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.GET_FAILED), null)
        );
      }
    }
  );

  /**
   * PATCH /:id/status
   * Update the read/archive status of a message.
   */
  router.patch(
    '/:id/status',
    authenticate,
    authorize(['merchant']),
    validateDto(updateMessageStatusDtoSchema, InboxConstants.ERRORS.STATUS_UPDATE_FAILED),
    async (req, res) => {
      try {
        const updated = await controller.updateMessageStatus(
          req.params.id,
          req.user.accountId,
          req.body.status
        );
        return res.status(200).json(
          ResponseUtils.success(InboxConstants.SUCCESS.STATUS_UPDATED, updated)
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.STATUS_UPDATE_FAILED), null)
        );
      }
    }
  );

  /**
   * POST /:id/reply
   * Send an outbound email reply for an existing inbox message.
   */
  router.post(
    '/:id/reply',
    authenticate,
    authorize(['merchant']),
    validateDto(replyToMessageDtoSchema, InboxConstants.ERRORS.REPLY_FAILED),
    async (req, res) => {
      try {
        const reply = await controller.replyToMessage(
          req.params.id,
          req.user.accountId,
          req.body,
        );
        return res.status(201).json(
          ResponseUtils.success(InboxConstants.SUCCESS.REPLY_SENT, reply)
        );
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, InboxConstants.ERRORS.REPLY_FAILED), null)
        );
      }
    }
  );

  return router;
}

export default createInboxMessageRoutes;
