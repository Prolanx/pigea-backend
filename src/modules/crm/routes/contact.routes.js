import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import createContactDtoSchema from '@modules/crm/dto/create-contact.validation.js';
import updateContactDtoSchema from '@modules/crm/dto/update-contact.validation.js';

/**
 * Contact routes
 * @param {ContactController} contactController - Contact controller instance
 * @returns {express.Router} Express router
 */
function createContactRoutes(contactController) {
  const router = express.Router();

  /**
   * POST /
   * Create a contact
   */
  router.post(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(createContactDtoSchema, 'Failed to create contact'),
    async (req, res) => {
      try {
        const contact = await contactController.createContact(req.body, req.user.accountId);
        return res.status(201).json({
          status: 'success',
          message: 'Contact created successfully',
          data: contact,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: 'error',
          message: error.message,
          data: null,
        });
      }
    }
  );

  /**
   * GET /
   * Get all contacts
   */
  router.get('/', authenticate, authorize(['merchant']), async (req, res) => {
    try {
      const { contactTypeId, status, source, limit } = req.query;
      const contacts = await contactController.getContacts(req.user.accountId, {
        contactTypeId,
        status,
        source,
        limit: limit ? parseInt(limit) : undefined,
      });
      return res.status(200).json({
        status: 'success',
        message: 'Contacts retrieved successfully',
        data: contacts,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message,
        data: null,
      });
    }
  });

  /**
   * GET /summary
   * Get contact summary metrics for the contact query page
   */
  router.get(
    '/summary',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const summary = await contactController.getContactSummary(req.user.accountId);
        return res.status(200).json({
          status: 'success',
          message: 'Contact summary retrieved successfully',
          data: summary,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: 'error',
          message: error.message,
          data: null,
        });
      }
    }
  );

  /**
   * GET /:id
   * Get contact by ID with message history
   */
  router.get(
    '/:id',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const contact = await contactController.getContactById(req.params.id, req.user.accountId);
        return res.status(200).json({
          status: 'success',
          message: 'Contact retrieved successfully',
          data: contact,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: 'error',
          message: error.message,
          data: null,
        });
      }
    }
  );

  /**
   * PATCH /:id
   * Update contact
   */
  router.patch(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto([...updateContactDtoSchema], 'Failed to update contact'),
    async (req, res) => {
      try {
        const contact = await contactController.updateContact(
          req.params.id,
          req.body,
          req.user.accountId
        );
        return res.status(200).json({
          status: 'success',
          message: 'Contact updated successfully',
          data: contact,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: 'error',
          message: error.message,
          data: null,
        });
      }
    }
  );

  /**
   * DELETE /:id
   * Delete contact
   */
  router.delete(
    '/:id',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const contact = await contactController.deleteContact(req.params.id, req.user.accountId);
        return res.status(200).json({
          status: 'success',
          message: 'Contact deleted successfully',
          data: contact,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: 'error',
          message: error.message,
          data: null,
        });
      }
    }
  );

  /**
   * POST /submit/:merchantId/:contactTypeId
   * Submit contact form (public endpoint)
   */
  router.post(
    '/submit/:merchantId/:contactTypeId',
    async (req, res) => {
      try {
        const contact = await contactController.submitContactForm(
          req.body,
          req.params.merchantId,
          req.params.contactTypeId
        );
        return res.status(201).json({
          status: 'success',
          message: 'Form submitted successfully',
          data: contact,
        });
      } catch (error) {
        return res.status(error.statusCode || 500).json({
          status: 'error',
          message: error.message,
          data: null,
        });
      }
    }
  );

  return router;
}

export default createContactRoutes;
