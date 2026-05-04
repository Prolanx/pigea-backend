import express from 'express';
import createFieldRoutes from './field.routes.js';
import createContactTypeRoutes from './contact-type.routes.js';
import createContactRoutes from './contact.routes.js';
import createMessageRoutes from './message.routes.js';
import createStatusRoutes from './status.routes.js';

/**
 * Main CRM routes - combines all CRM route modules
 * @param {Object} controllers - Controller instances
 * @returns {express.Router} Express router
 */
function createCrmRoutes(controllers) {
  const router = express.Router();
  const {
    fieldDefinitionController,
    contactTypeController,
    contactController,
    messageController,
    statusController,
  } = controllers;

  // Mount sub-routes
  router.use('/fields', createFieldRoutes(fieldDefinitionController));
  router.use('/contact-types', createContactTypeRoutes(contactTypeController));
  router.use('/contacts', createContactRoutes(contactController));
  router.use('/messages', createMessageRoutes(messageController));
  router.use('/status', createStatusRoutes(statusController));

  return router;
}

export default createCrmRoutes;
