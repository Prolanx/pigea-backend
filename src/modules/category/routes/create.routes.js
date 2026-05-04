import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import createCategoryDtoSchema from '@modules/category/dto/create-category.validation.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

/**
 * Create category routes
 * @param {CategoryController} controller - Category controller instance
 * @returns {express.Router} Express router
 */
function createCategoryCreateRoutes(controller) {
  const router = express.Router();

  /**
   * POST /
   * Create a new category
   */
  router.post(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(createCategoryDtoSchema, 'Failed to create category'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const category = await controller.createCategory(req.body, merchantId);
        return res.status(201).json({
          status: 'success',
          data: category,
        });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to create category'),
        });
      }
    }
  );

  return router;
}

export default createCategoryCreateRoutes;
