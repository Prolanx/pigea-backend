import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function forgotPassword(email) {
  try {
    const account = await this.accountDAO.findByEmail(email);

    if (!account) {
      return ResponseUtils.success(AuthConstants.SUCCESS.PASSWORD_RESET_SENT, null);
    }

    // Throttle: do not allow resending more than once every 60 seconds
    const COOLDOWN_SECONDS = 60;
    if (account.passwordResetTokenSentAt) {
      const last = new Date(account.passwordResetTokenSentAt).getTime();
      const elapsed = Math.floor((Date.now() - last) / 1000);
      if (elapsed < COOLDOWN_SECONDS) {
        const retryAfter = COOLDOWN_SECONDS - elapsed;
        return ResponseUtils.error(AuthConstants.ERRORS.RESEND_TOO_SOON, { retryAfter });
      }
    }

    const resetToken = this.tokenGenerator.generateVerificationCode();
    let resetMs;
    try {
      resetMs = this.tokenGenerator.parseTimeToMs(common.constants.env.PASSWORD_RESET_TOKEN_EXPIRES_IN);
    } catch (err) {
      console.error('Token expiry configuration error (PASSWORD_RESET_TOKEN_EXPIRES_IN):', err);
      throw new ControllerError(AuthConstants.ERRORS.FORGOT_PASSWORD_FAILED);
    }
    const resetTokenExpiry = this.tokenGenerator.getTokenExpiryMs(resetMs);

    await this.accountDAO.setPasswordResetToken(email, resetToken, resetTokenExpiry);

    try {
      await this.emailAdapter.sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error(emailError);
    }

    return ResponseUtils.success(AuthConstants.SUCCESS.PASSWORD_RESET_SENT, {
      expiresAt: resetTokenExpiry,
    });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.FORGOT_PASSWORD_FAILED);
  }
}
