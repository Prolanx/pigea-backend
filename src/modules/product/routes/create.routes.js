import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import createProductDtoSchema from '@modules/product/dto/create-product.validation.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

function createProductCreateRoutes(controller) {
  const router = express.Router();

  router.post(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(createProductDtoSchema, 'Failed to create product'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const product = await controller.createProduct(req.body, merchantId);
        return res.status(201).json({ status: 'success', data: product });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to create product'),
          data: null,
        });
      }
    }
  );

  return router;
}

export default createProductCreateRoutes;
