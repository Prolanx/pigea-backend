import express from 'express';
import { authenticate } from '@common/middleware/auth.middleware.js';
import { ResponseUtils } from '@common/utilities/response.js';
import { ControllerError, DAOError } from '@common/errors.js';

export function createOnboardingRoutes(controller) {
  const router = express.Router();

  // POST /onboarding - update onboarding info for current user
  router.post('/', authenticate, async (req, res) => {
    try {
      const userId = req.user.accountId;
      const result = await controller.updateOnboarding(userId, req.body);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        return res.status(error.statusCode).json(ResponseUtils.error(error.message, null));
      }
      return res.status(500).json(ResponseUtils.error('Onboarding update failed', null));
    }
  });

  return router;
}
