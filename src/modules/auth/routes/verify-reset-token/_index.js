import express from 'express';
import { verifyResetTokenRoute } from '@modules/auth/routes/verify-reset-token/verifyResetToken.route.js';

export function createVerifyResetTokenRoutes(controller) {
  const router = express.Router();

  verifyResetTokenRoute(router, controller);

  return router;
}
