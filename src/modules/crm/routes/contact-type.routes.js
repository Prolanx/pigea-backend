import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import createContactTypeDtoSchema from '@modules/crm/dto/create-contact-type.validation.js';
import updateContactTypeDtoSchema from '@modules/crm/dto/update-contact-type.validation.js';

/**
 * Contact type routes
 * @param {ContactTypeController} contactTypeController - Contact type controller instance
 * @returns {express.Router} Express router
 */
function createContactTypeRoutes(contactTypeController) {
  const router = express.Router();

  /**
   * POST /
   * Create a contact type
   */
  router.post(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(createContactTypeDtoSchema, 'Failed to create contact type'),
    async (req, res) => {
      try {
        const contactType = await contactTypeController.createContactType(req.body, req.user.accountId);
        return res.status(201).json({
          status: 'success',
          message: 'Contact type created successfully',
          data: contactType,
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
   * Get all contact types
   */
  router.get('/', authenticate, authorize(['merchant']), async (req, res) => {
    try {
      const contactTypes = await contactTypeController.getContactTypes(req.user.accountId);
      return res.status(200).json({
        status: 'success',
        message: 'Contact types retrieved successfully',
        data: contactTypes,
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
   * GET /:id
   * Get contact type by ID
   */
  router.get(
    '/:id',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const contactType = await contactTypeController.getContactTypeById(
          req.params.id,
          req.user.accountId
        );
        return res.status(200).json({
          status: 'success',
          message: 'Contact type retrieved successfully',
          data: contactType,
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
   * Update contact type
   */
  router.patch(
    '/:id',
    authenticate,
    authorize(['merchant']),
    validateDto([...updateContactTypeDtoSchema], 'Failed to update contact type'),
    async (req, res) => {
      try {
        const contactType = await contactTypeController.updateContactType(
          req.params.id,
          req.body,
          req.user.accountId
        );
        return res.status(200).json({
          status: 'success',
          message: 'Contact type updated successfully',
          data: contactType,
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
   * Delete contact type
   */
  router.delete(
    '/:id',
    authenticate,
    authorize(['merchant']),
    async (req, res) => {
      try {
        const contactType = await contactTypeController.deleteContactType(
          req.params.id,
          req.user.accountId
        );
        return res.status(200).json({
          status: 'success',
          message: 'Contact type deleted successfully',
          data: contactType,
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

export default createContactTypeRoutes;
