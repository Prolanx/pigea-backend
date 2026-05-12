import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import { ResponseUtils } from '@common/utilities/response.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';
import { messageTemplateIdParamDtoSchema } from '@modules/message-template/dto/param.validation.js';

function createMessageTemplateDeleteRoutes(controller) {
  const router = express.Router();

  router.delete(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(messageTemplateIdParamDtoSchema, 'Failed to delete message template'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const deleted = await controller.deleteMessageTemplate(req.params.id, merchantId);
        return res.status(200).json(ResponseUtils.success('Message template deleted successfully', deleted));
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json(
          ResponseUtils.error(getRouteErrorMessage(error, 'Failed to delete message template'), null),
        );
      }
    },
  );

  return router;
}

export default createMessageTemplateDeleteRoutes;
