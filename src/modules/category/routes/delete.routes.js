import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { categoryIdParamDtoSchema } from '@modules/category/dto/param.validation.js';
import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

/**
 * Delete category routes
 * @param {CategoryController} controller - Category controller instance
 * @returns {express.Router} Express router
 */
function createCategoryDeleteRoutes(controller) {
  const router = express.Router();

  /**
   * DELETE /:id
   * Delete category
   */
  router.delete(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(categoryIdParamDtoSchema, 'Invalid category ID'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const deletedCategory = await controller.deleteCategory(req.params.id, merchantId);
        return res.status(200).json({
          status: 'success',
          data: deletedCategory,
        });
      } catch (error) {
        return res.status(getRouteErrorStatusCode(error)).json({
          status: 'error',
          message: getRouteErrorMessage(error, 'Failed to delete category'),
        });
      }
    }
  );

  return router;
}

export default createCategoryDeleteRoutes;
