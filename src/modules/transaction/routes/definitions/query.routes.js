import express from 'express';
import { validateDto } from '@common/middleware/validate-dto.js';
import { transactionIdQueryDtoSchema } from '@modules/transaction/dto/param.validation.js';
import { getTransactionByTransactionIdHandler } from '../handlers/getTransactionByTransactionIdHandler.js';

/**
 * Create transaction query routes
 * @param {Object} controller - Transaction controller instance
 * @returns {express.Router} Express router
 */
export default function createTransactionQueryRoutes(controller) {
  const router = express.Router();

  router.get(
    '/query',
    validateDto(transactionIdQueryDtoSchema),
    async (req, res) => getTransactionByTransactionIdHandler(req, res, controller)
  );

  return router;
}
