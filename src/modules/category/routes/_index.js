import express from 'express';
import createCategoryCreateRoutes from './create.routes.js';
import createCategoryReadRoutes from './read.routes.js';
import createCategoryUpdateRoutes from './update.routes.js';
import createCategoryDeleteRoutes from './delete.routes.js';

/**
 * Create all category routes
 * @param {CategoryController} controller - Category controller instance
 * @returns {express.Router} Express router
 */
function createCategoryRoutes(controller) {
  const router = express.Router();

  router.use('/', createCategoryCreateRoutes(controller));
  router.use('/', createCategoryReadRoutes(controller));
  router.use('/', createCategoryUpdateRoutes(controller));
  router.use('/', createCategoryDeleteRoutes(controller));

  return router;
}

export default createCategoryRoutes;
