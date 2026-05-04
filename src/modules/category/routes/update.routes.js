import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { categoryIdParamDtoSchema } from '@modules/category/dto/param.validation.js';
import updateCategoryDtoSchema from '@modules/category/dto/update-category.validation.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

/**
 * Update category routes
 * @param {CategoryController} controller - Category controller instance
 * @returns {express.Router} Express router
 */
function createCategoryUpdateRoutes(controller) {
  const router = express.Router();

  /**
   * PUT /:id
   * Update category
   */
  router.put(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto([...categoryIdParamDtoSchema, ...updateCategoryDtoSchema], 'Failed to update category'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const category = await controller.updateCategory(req.params.id, req.body, merchantId);
        return res.status(200).json({
          status: 'success',
          data: category,
        });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to update category'),
          data: null,
        });
      }
    }
  );

  return router;
}

export default createCategoryUpdateRoutes;
