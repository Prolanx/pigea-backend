import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import createInvoiceDtoSchema from '@modules/invoice/dto/create-invoice.validation.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { createInvoiceHandler } from '@modules/invoice/routes/handlers/createInvoiceHandler.js';

/**
 * Create invoice routes
 * @param {InvoiceController} controller - Invoice controller instance
 * @returns {express.Router} Express router
 */
function createInvoiceCreateRoutes(controller) {
  const router = express.Router();

  /**
   * POST /
   * Create a new invoice
   */
  router.post(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(createInvoiceDtoSchema, 'Failed to create invoice'),
    async (req, res) => createInvoiceHandler(req, res, controller)
  );

  return router;
}

export default createInvoiceCreateRoutes;
