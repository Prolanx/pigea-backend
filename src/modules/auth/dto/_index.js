import signupDtoSchema from '@modules/auth/dto/signup.dto.js';
import loginDtoSchema from '@modules/auth/dto/login.dto.js';
import verifyEmailDtoSchema from '@modules/auth/dto/verify-email.dto.js';
import resendVerificationDtoSchema from '@modules/auth/dto/resend-verification.dto.js';
import forgotPasswordDtoSchema from '@modules/auth/dto/forgot-password.dto.js';
import verifyResetTokenDtoSchema from '@modules/auth/dto/verify-reset-token.dto.js';
import resendResetCodeDtoSchema from '@modules/auth/dto/resend-reset-code.dto.js';
import resetPasswordDtoSchema from '@modules/auth/dto/reset-password.dto.js';
import refreshTokenDtoSchema from '@modules/auth/dto/refresh-token.dto.js';
import autoLoginDtoSchema from '@modules/auth/dto/auto-login.dto.js';

export const dto = {
  signupDtoSchema,
  loginDtoSchema,
  verifyEmailDtoSchema,
  resendVerificationDtoSchema,
  forgotPasswordDtoSchema,
  verifyResetTokenDtoSchema,
  resendResetCodeDtoSchema,
  resetPasswordDtoSchema,
  refreshTokenDtoSchema,
  autoLoginDtoSchema,
};
