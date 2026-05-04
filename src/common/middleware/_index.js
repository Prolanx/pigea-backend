import { validateDto } from '@common/middleware/validate-dto.js';
import { authenticate, authorize } from '@common/middleware/auth.middleware.js';
import { authenticateForLogout } from '@common/middleware/auth-logout.middleware.js';
import * as debug from '@common/middleware/debug.js';

export const middleware = {
  validateDto,
  authenticate,
  authorize,
  authenticateForLogout,
  debug
};
