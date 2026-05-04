import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { idParamDtoSchema } from '@modules/invoice/dto/param.validation.js';
import updateStatusDtoSchema from '@modules/invoice/dto/update-status.validation.js';
import updateInvoiceDtoSchema from '@modules/invoice/dto/update-invoice.validation.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { updateInvoiceStatusHandler } from '@modules/invoice/routes/handlers/updateInvoiceStatusHandler.js';
import { updateInvoiceHandler } from '@modules/invoice/routes/handlers/updateInvoiceHandler.js';

/**
 * Update invoice routes (change invoice status)
 * @param {InvoiceController} controller - Invoice controller instance
 * @returns {express.Router} Express router
 */
function createInvoiceUpdateRoutes(controller) {
  const router = express.Router();

  /**
   * PATCH /:id/status
   * Update invoice status
   */
  router.patch(
    '/:id/status',
    authenticate,
    authorize(['merchant']),
    validateDto([...idParamDtoSchema, ...updateStatusDtoSchema], 'Failed to update invoice status'),
    async (req, res) => updateInvoiceStatusHandler(req, res, controller)
  );

  /**
   * PUT /:id
   * Update invoice data (merchant-scoped)
   * Does NOT update status - use PATCH /:id/status for that
   */
  router.put(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto([...idParamDtoSchema, ...updateInvoiceDtoSchema], 'Failed to update invoice'),
    async (req, res) => updateInvoiceHandler(req, res, controller)
  );

  return router;
}

export default createInvoiceUpdateRoutes;
