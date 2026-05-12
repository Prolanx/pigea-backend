import express from 'express';
import createMessageTemplateCreateRoutes from '@modules/message-template/routes/create.routes.js';
import createMessageTemplateReadRoutes from '@modules/message-template/routes/read.routes.js';
import createMessageTemplateUpdateRoutes from '@modules/message-template/routes/update.routes.js';
import createMessageTemplateDeleteRoutes from '@modules/message-template/routes/delete.routes.js';

function createMessageTemplateRoutes(controller) {
  const router = express.Router();

  router.use('/', createMessageTemplateCreateRoutes(controller));
  router.use('/', createMessageTemplateReadRoutes(controller));
  router.use('/', createMessageTemplateUpdateRoutes(controller));
  router.use('/', createMessageTemplateDeleteRoutes(controller));

  return router;
}

export default createMessageTemplateRoutes;
