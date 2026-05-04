/**
 * Product Module Exports
 * Central export point for product module
 */
import { controller } from './controller/_index.js';
import { dao } from './dao/_index.js';
import * as dto from './dto/_index.js';
import createProductRoutes from './routes/_index.js';

export const product = {
  controller,
  dao,
  dto,
  routes: { createProductRoutes }
};

export default product;
