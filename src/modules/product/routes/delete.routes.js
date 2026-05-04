import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { productIdParamDtoSchema } from '@modules/product/dto/param.validation.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

function createProductDeleteRoutes(controller) {
  const router = express.Router();

  router.delete(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(productIdParamDtoSchema, 'Invalid product ID'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const deletedProduct = await controller.deleteProduct(req.params.id, merchantId);
        return res.status(200).json({ status: 'success', data: deletedProduct });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to delete product'),
          data: null,
        });
      }
    }
  );

  return router;
}

export default createProductDeleteRoutes;
