import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import sendMessageDtoSchema from '@modules/crm/dto/send-message.validation.js';

/**
 * Message routes
 * @param {MessageController} messageController - Message controller instance
 * @returns {express.Router} Express router
 */
function createMessageRoutes(messageController) {
  const router = express.Router();

  /**
   * POST /
   * Send an email reply to a contact
   */
  router.post(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(sendMessageDtoSchema, 'Failed to send message'),
    async (req, res) => {
      try {
        const message = await messageController.sendReply(req.body, req.user.accountId);
        return res.status(201).json({
          status: 'success',
          message: 'Email sent successfully',
          data: message,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: 'error',
          message: error.message,
          data: null,
        });
      }
    }
  );

  /**
   * GET /contact/:contactId
   * Get message history for a contact
   */
  router.get(
    '/contact/:contactId',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const messages = await messageController.getMessageHistory(
          req.params.contactId,
          req.user.accountId,
        );
        return res.status(200).json({
          status: 'success',
          message: 'Message history retrieved successfully',
          data: messages,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: 'error',
          message: error.message,
          data: null,
        });
      }
    }
  );

  return router;
}

export default createMessageRoutes;
