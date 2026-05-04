import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { idParamDtoSchema, invoiceNumberQueryDtoSchema, invoicePaymentDtoSchema } from '@modules/invoice/dto/param.validation.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { getInvoiceByIdHandler } from '@modules/invoice/routes/handlers/getInvoiceByIdHandler.js';
import { getInvoiceVersionsHandler } from '@modules/invoice/routes/handlers/getInvoiceVersionsHandler.js';
import { decodePaymentTokenHandler } from '@modules/invoice/routes/handlers/decodePaymentTokenHandler.js';
import { getInvoiceByNumberHandler } from '@modules/invoice/routes/handlers/getInvoiceByNumberHandler.js';
import { getInvoiceSummaryHandler } from '@modules/invoice/routes/handlers/getInvoiceSummaryHandler.js';
import { processInvoicePaymentHandler } from '@modules/invoice/routes/handlers/processInvoicePaymentHandler.js';

/**
 * Query invoice routes (view invoice information)
 * @param {InvoiceController} controller - Invoice controller instance
 * @returns {express.Router} Express router
 */
function createInvoiceQueryRoutes(controller) {
  const router = express.Router();

  /**
   * GET /info/:id
   * Simpler validation: id must be present and a non-empty string. Validation handled by DTO.
   */
  router.get(
    '/info/:id',
    authenticate,
    authorize(['merchant']),
    validateDto(idParamDtoSchema),
    async (req, res) => getInvoiceByIdHandler(req, res, controller)
  );

  /**
   * GET /info/:id/versions
   * Get version history for an invoice (root id or latest id)
   */
  router.get(
    '/info/:id/versions',
    authenticate,
    authorize(['merchant']),
    validateDto(idParamDtoSchema),
    async (req, res) => getInvoiceVersionsHandler(req, res, controller)
  );

  router.post(
    '/payment-token',
    authenticate,
    authorize(['merchant', 'customer']),
    async (req, res) => decodePaymentTokenHandler(req, res, controller)
  );

  // Public invoice fetch by invoice number (no auth required for customer-facing invoice payment flow)
  router.get(
    '/query',
    validateDto(invoiceNumberQueryDtoSchema),
    async (req, res) => getInvoiceByNumberHandler(req, res, controller)
  );

  // Merchant invoice summary for dashboard counts
  router.get(
    '/summary',
    authenticate,
    authorize(['merchant']),
    async (req, res) => getInvoiceSummaryHandler(req, res, controller)
  );

  // Public invoice payment simulation endpoint
  router.post(
    '/confirm-payment',
    validateDto(invoicePaymentDtoSchema),
    async (req, res) => processInvoicePaymentHandler(req, res, controller)
  );

  return router;
}

export default createInvoiceQueryRoutes;
