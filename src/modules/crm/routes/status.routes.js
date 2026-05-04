import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import createStatusDtoSchema from '@modules/crm/dto/create-status.validation.js';
import updateStatusDtoSchema from '@modules/crm/dto/update-status.validation.js';

/**
 * Create status routes
 * @param {Object} statusController - Status controller instance
 * @returns {express.Router} Express router
 */
export default function createStatusRoutes(statusController) {
  const router = express.Router();

  // All routes require authentication and merchant role
  router.use(authenticate);
  router.use(authorize(['merchant']));

  /**
   * GET /api/crm/statuses
   * Get all statuses (system + custom) for merchant
   */
  router.get('/', async (req, res) => {
    try {
      const merchantId = req.user.accountId;
      const statuses = await statusController.getAllStatuses(merchantId);
      
      return res.status(200).json({
        status: 'success',
        message: 'Statuses retrieved successfully',
        data: statuses,
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
   * Get status summary counts (system + custom)
   */
  router.get('/summary', async (req, res) => {
    try {
      const merchantId = req.user.accountId;
      const summary = await statusController.getStatusSummary(merchantId);
      return res.status(200).json({
        status: 'success',
        message: 'Status summary retrieved successfully',
        data: summary,
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
   * GET /api/crm/statuses/:id
   * Get status by ID (system or custom)
   * No validation - accepts both system IDs (sys_*) and MongoDB ObjectIds
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const merchantId = req.user.accountId;
      const status = await statusController.getStatusById(id, merchantId);
      
      return res.status(200).json({
        status: 'success',
        message: 'Status retrieved successfully',
        data: status,
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
   * POST /api/crm/statuses
   * Create a new custom status
   */
  router.post('/', validateDto(createStatusDtoSchema, 'Failed to create status'), async (req, res) => {
    try {
      const merchantId = req.user.accountId;
      const status = await statusController.createStatus(req.body, merchantId);
      
      return res.status(201).json({
        status: 'success',
        message: 'Status created successfully',
        data: status,
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
   * PATCH /api/crm/statuses/:id
   * Update a custom status
   * No ID validation - controller handles both system and custom status IDs
   */
  router.patch('/:id', validateDto(updateStatusDtoSchema, 'Failed to update status'), async (req, res) => {
    try {
      const { id } = req.params;
      const merchantId = req.user.accountId;
      const status = await statusController.updateStatus(id, req.body, merchantId);
      
      return res.status(200).json({
        status: 'success',
        message: 'Status updated successfully',
        data: status,
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
   * DELETE /api/crm/statuses/:id
   * Delete a custom status
   * No ID validation - controller handles both system and custom status IDs
   */
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const merchantId = req.user.accountId;
      const status = await statusController.deleteStatus(id, merchantId);
      
      return res.status(200).json({
        status: 'success',
        message: 'Status deleted successfully',
        data: status,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message,
        data: null,
      });
    }
  });

  return router;
}
