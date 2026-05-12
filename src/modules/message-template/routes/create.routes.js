import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import { ResponseUtils } from '@common/utilities/response.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';
import createMessageTemplateDtoSchema from '@modules/message-template/dto/create-message-template.validation.js';

function createMessageTemplateCreateRoutes(controller) {
  const router = express.Router();

  router.post(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(createMessageTemplateDtoSchema, 'Failed to create message template'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const template = await controller.createMessageTemplate(req.body, merchantId);
        return res.status(201).json(ResponseUtils.success('Message template created successfully', template));
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, 'Failed to create message template'), null),
        );
      }
    },
  );

  return router;
}

export default createMessageTemplateCreateRoutes;
