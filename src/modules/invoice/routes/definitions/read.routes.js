import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { getAllInvoicesHandler } from '@modules/invoice/routes/handlers/getAllInvoicesHandler.js';

/**
 * Read all invoices routes
 * @param {InvoiceController} controller - Invoice controller instance
 * @returns {express.Router} Express router
 */
function createInvoiceReadRoutes(controller) {
  const router = express.Router();

  /**
   * GET /list
   * Get all invoices (sorted by latest first)
   * NOTE: collection endpoint moved to '/list' to avoid ambiguity with the single-item route.
   */
  router.get(
    '/list',
    authenticate,
    authorize(['merchant']),
    async (req, res) => getAllInvoicesHandler(req, res, controller)
  );

  return router;
}

export default createInvoiceReadRoutes;
