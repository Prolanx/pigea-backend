import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import { ResponseUtils } from '@common/utilities/response.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';
import updateMessageTemplateDtoSchema from '@modules/message-template/dto/update-message-template.validation.js';
import { messageTemplateIdParamDtoSchema } from '@modules/message-template/dto/param.validation.js';

function createMessageTemplateUpdateRoutes(controller) {
  const router = express.Router();

  router.put(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(messageTemplateIdParamDtoSchema, 'Failed to update message template'),
    validateDto(updateMessageTemplateDtoSchema, 'Failed to update message template'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const updated = await controller.updateMessageTemplate(req.params.id, req.body, merchantId);
        return res.status(200).json(ResponseUtils.success('Message template updated successfully', updated));
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, 'Failed to update message template'), null),
        );
      }
    },
  );

  return router;
}

export default createMessageTemplateUpdateRoutes;
