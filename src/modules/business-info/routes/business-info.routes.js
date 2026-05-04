import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { validateDto } from '@common/middleware/validate-dto.js';
import businessInfoDtoSchema from '@modules/business-info/dto/create-business-info.validation.js';
import BusinessInfoController from '@modules/business-info/controller/businessInfo.controller.js';
import AccountDAO from '@modules/auth/dao/account-dao/_index.js';

function createBusinessInfoRoutes(controller) {
  const router = express.Router();
  const ctrl = controller || new BusinessInfoController(new AccountDAO());

  // GET /api/business-info  -> fetch current merchant business info
  router.get('/', authenticate, authorize(['merchant']), async (req, res) => {
    try {
      const merchantId = req.user.accountId;
      const data = await ctrl.getBusinessInfo(merchantId);
      return res.status(200).json({ status: 'success', message: 'Business info retrieved', data });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ status: 'error', message: error.message, data: null });
    }
  });

  // POST /api/business-info -> create/update business info
  router.post(
    '/',
    authenticate,
    authorize(['merchant']),
    validateDto(businessInfoDtoSchema, 'Failed to save business info'),
    async (req, res) => {
      try {
        const merchantId = req.user.accountId;
        const payload = req.body;
        const saved = await ctrl.saveBusinessInfo(payload, merchantId);
        return res.status(200).json({ status: 'success', message: 'Business info saved', data: saved });
      } catch (error) {
        return res.status(error.statusCode || 500).json({ status: 'error', message: error.message, data: null });
      }
    },
  );

  return router;
}

export default createBusinessInfoRoutes;