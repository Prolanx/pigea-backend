import express from 'express';
import createProductCreateRoutes from './create.routes.js';
import createProductReadRoutes from './read.routes.js';
import createProductUpdateRoutes from './update.routes.js';
import createProductDeleteRoutes from './delete.routes.js';

function createProductRoutes(controller) {
  const router = express.Router();

  router.use('/', createProductCreateRoutes(controller));
  router.use('/', createProductReadRoutes(controller));
  router.use('/', createProductUpdateRoutes(controller));
  router.use('/', createProductDeleteRoutes(controller));

  return router;
}

export default createProductRoutes;
