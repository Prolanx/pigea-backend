import express from 'express';
import createInvoiceCreateRoutes from '@modules/invoice/routes/definitions/create.routes.js';
import createInvoiceReadRoutes from '@modules/invoice/routes/definitions/read.routes.js';
import createInvoiceQueryRoutes from '@modules/invoice/routes/definitions/query.routes.js';
import createInvoiceUpdateRoutes from '@modules/invoice/routes/definitions/update.routes.js';
import createInvoiceDeleteRoutes from '@modules/invoice/routes/definitions/delete.routes.js';

/**
 * Main invoice routes - combines all invoice route modules
 * @param {InvoiceController} controller - Invoice controller instance
 * @returns {express.Router} Express router
 */
function createInvoiceRoutes(controller) {
  const router = express.Router();

  // Mount sub-routes
  router.use('/', createInvoiceReadRoutes(controller));
  router.use('/', createInvoiceCreateRoutes(controller));
  router.use('/', createInvoiceQueryRoutes(controller));
  router.use('/', createInvoiceUpdateRoutes(controller));
  router.use('/', createInvoiceDeleteRoutes(controller));

  return router;
}

export default createInvoiceRoutes;
