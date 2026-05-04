import { createAuthRoutes } from '@modules/auth/routes/auth/_index.js';
import { createVerifyResetTokenRoutes } from '@modules/auth/routes/verify-reset-token/_index.js';

export const routes = {
  createAuthRoutes,
  createVerifyResetTokenRoutes,
};
