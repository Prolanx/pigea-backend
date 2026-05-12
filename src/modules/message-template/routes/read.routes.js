import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import { ResponseUtils } from '@common/utilities/response.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';
import { messageTemplateIdParamDtoSchema } from '@modules/message-template/dto/param.validation.js';

function createMessageTemplateReadRoutes(controller) {
  const router = express.Router();

  router.get(
    '/',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const templates = await controller.getMessageTemplates(merchantId);
        return res.status(200).json(ResponseUtils.success('Message templates retrieved successfully', templates));
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, 'Failed to get message templates'), null),
        );
      }
    },
  );

  router.get(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(messageTemplateIdParamDtoSchema, 'Failed to get message template'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const template = await controller.getMessageTemplateById(req.params.id, merchantId);
        return res.status(200).json(ResponseUtils.success('Message template retrieved successfully', template));
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, 'Failed to get message template'), null),
        );
      }
    },
  );

  return router;
}

export default createMessageTemplateReadRoutes;
