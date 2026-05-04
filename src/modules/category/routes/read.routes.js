import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { categoryIdParamDtoSchema } from '@modules/category/dto/param.validation.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

/**
 * Read category routes
 * @param {CategoryController} controller - Category controller instance
 * @returns {express.Router} Express router
 */
function createCategoryReadRoutes(controller) {
  const router = express.Router();

  /**
   * GET /
   * Get all categories for merchant
   */
  router.get(
    '/',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const categories = await controller.getCategories(merchantId);
        return res.status(200).json({
          status: 'success',
          data: categories,
        });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to get categories'),
        });
      }
    }
  );

  /**
   * GET /summary
   * Get category summary counts for merchant dashboard
   */
  router.get(
    '/summary',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const summary = await controller.getCategorySummary(merchantId);
        return res.status(200).json({
          status: 'success',
          data: summary,
        });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to get category summary'),
        });
      }
    }
  );

  /**
   * GET /:id
   * Get category by ID
   */
  router.get(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(categoryIdParamDtoSchema),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const category = await controller.getCategoryById(req.params.id, merchantId);
        return res.status(200).json({
          status: 'success',
          data: category,
        });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to get category'),
        });
      }
    }
  );

  return router;
}

export default createCategoryReadRoutes;
