import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { productIdParamDtoSchema } from '@modules/product/dto/param.validation.js';
import updateProductDtoSchema from '@modules/product/dto/update-product.validation.js';
import updateInventoryDtoSchema from '@modules/product/dto/update-inventory.validation.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

function createProductUpdateRoutes(controller) {
  const router = express.Router();

  router.put(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto([...productIdParamDtoSchema, ...updateProductDtoSchema], 'Failed to update product'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const product = await controller.updateProduct(req.params.id, req.body, merchantId);
        return res.status(200).json({ status: 'success', data: product });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to update product'),
          data: null,
        });
      }
    }
  );

  router.patch(
    '/:id/inventory',
    authenticate,
    authorize(['merchant']),
    validateDto([...productIdParamDtoSchema, ...updateInventoryDtoSchema], 'Failed to update inventory'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const product = await controller.updateInventory(req.params.id, req.body.quantity, merchantId);
        return res.status(200).json({ status: 'success', data: product });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to update inventory'),
          data: null,
        });
      }
    }
  );

  return router;
}

export default createProductUpdateRoutes;
