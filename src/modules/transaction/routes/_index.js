import express from 'express';
import createTransactionQueryRoutes from './definitions/query.routes.js';

/**
 * Create all transaction routes
 * @param {Object} controller - Transaction controller instance
 * @returns {express.Router} Express router
 */
export default function createTransactionRoutes(controller) {
  const router = express.Router();
  router.use('/', createTransactionQueryRoutes(controller));
  return router;
}
