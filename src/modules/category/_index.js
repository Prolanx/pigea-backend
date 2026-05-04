/**
 * Category module - namespace export (complies with guidelines)
 */
import { controller } from './controller/_index.js';
import { dao } from './dao/_index.js';
import * as dto from './dto/_index.js';
import createCategoryRoutes from './routes/_index.js';

export const category = {
  controller,
  dao,
  dto,
  routes: { createCategoryRoutes }
};

export default category;
