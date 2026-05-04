import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { productIdParamDtoSchema } from '@modules/product/dto/param.validation.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

function createProductReadRoutes(controller) {
  const router = express.Router();

  router.get(
    '/',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const filters = {};
        if (req.query.categoryId) filters.categoryId = req.query.categoryId;
        if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
        
        const products = await controller.getProducts(merchantId, filters);
        return res.status(200).json({ status: 'success', data: products });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to get products'),
        });
      }
    }
  );

  router.get(
    '/summary',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const summary = await controller.getProductSummary(merchantId);
        return res.status(200).json({ status: 'success', data: summary });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to get product summary'),
        });
      }
    }
  );

  router.get(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(productIdParamDtoSchema),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const product = await controller.getProductById(req.params.id, merchantId);
        return res.status(200).json({ status: 'success', data: product });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to get product'),
        });
      }
    }
  );

  return router;
}

export default createProductReadRoutes;
