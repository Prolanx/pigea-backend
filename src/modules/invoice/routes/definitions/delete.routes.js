import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { idParamDtoSchema } from '@modules/invoice/dto/param.validation.js';
import { deleteInvoiceHandler } from '@modules/invoice/routes/handlers/deleteInvoiceHandler.js';

/**
 * Delete invoice routes
 * @param {InvoiceController} controller
 * @returns {express.Router}
 */
function createInvoiceDeleteRoutes(controller) {
  const router = express.Router();

  /**
   * DELETE /:id
   * Delete invoice (merchant-scoped)
   */
  router.delete(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(idParamDtoSchema, 'Invalid invoice ID'),
    async (req, res) => deleteInvoiceHandler(req, res, controller)
  );

  return router;
}

export default createInvoiceDeleteRoutes;
