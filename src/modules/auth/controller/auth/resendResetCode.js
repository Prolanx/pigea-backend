import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';
import { buildPasswordResetEmail } from '@modules/auth/utils/email-templates.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function resendResetCode(email) {
  try {
    const account = await this.accountDAO.findByEmail(email);
    if (!account) {
      return ResponseUtils.success(AuthConstants.SUCCESS.RESET_CODE_RESENT, null);
    }

    if (account.passwordResetToken && account.passwordResetTokenExpiry && account.passwordResetTokenExpiry > Date.now()) {
      let expiresAt = account.passwordResetTokenExpiry;
      if (expiresAt instanceof Date) expiresAt = expiresAt.getTime();
      else expiresAt = Number(expiresAt);
      return ResponseUtils.error(AuthConstants.ERRORS.RESET_CODE_NOT_EXPIRED, {
        expiresAt,
      });
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
      throw new ControllerError(AuthConstants.ERRORS.RESEND_RESET_CODE_FAILED);
    }
    const resetTokenExpiry = this.tokenGenerator.getTokenExpiryMs(resetMs);
    await this.accountDAO.setPasswordResetToken(email, resetToken, resetTokenExpiry);

    try {
      await this.emailAdapter.sendEmail(buildPasswordResetEmail(email, resetToken));
    } catch (emailError) {
      console.error(emailError);
    }

    return ResponseUtils.success(AuthConstants.SUCCESS.RESET_CODE_RESENT, {
      expiresAt: resetTokenExpiry,
    });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.RESEND_RESET_CODE_FAILED);
  }
}
