import express from 'express';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';

export default function createStatRoutes(statController) {
  const router = express.Router();

  // GET metrics for current merchant
  router.get(
    '/',
    authenticate,
    authorize(['merchant']),
    async (req, res, next) => {
      try {
        console.log("stats req.user ", req.user);
        const merchantId = req.user.accountId;
        const stats = await statController.getStats(merchantId);
        res.json({ status: 'success', data: stats });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
