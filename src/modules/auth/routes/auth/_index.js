import express from 'express';
import { signupRoute } from '@modules/auth/routes/auth/signup.route.js';
import { verifyEmailRoute } from '@modules/auth/routes/auth/verifyEmail.route.js';
import { loginRoute } from '@modules/auth/routes/auth/login.route.js';
import { refreshAccessTokenRoute } from '@modules/auth/routes/auth/refreshAccessToken.route.js';
import { resendVerificationRoute } from '@modules/auth/routes/auth/resendVerification.route.js';
import { logoutRoute } from '@modules/auth/routes/auth/logout.route.js';
import { forgotPasswordRoute } from '@modules/auth/routes/auth/forgotPassword.route.js';
import { resetPasswordRoute } from '@modules/auth/routes/auth/resetPassword.route.js';
import { resendResetCodeRoute } from '@modules/auth/routes/auth/resendResetCode.route.js';
import { autoLoginRoute } from '@modules/auth/routes/auth/autoLogin.route.js';

export function createAuthRoutes(controller) {
  const router = express.Router();

  signupRoute(router, controller);
  verifyEmailRoute(router, controller);
  loginRoute(router, controller);
  refreshAccessTokenRoute(router, controller);
  resendVerificationRoute(router, controller);
  logoutRoute(router, controller);
  forgotPasswordRoute(router, controller);
  resetPasswordRoute(router, controller);
  resendResetCodeRoute(router, controller);
  autoLoginRoute(router, controller);

  return router;
}
