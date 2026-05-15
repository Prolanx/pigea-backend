import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';
import { buildVerificationEmail } from '@modules/auth/utils/email-templates.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function resendVerification(email) {
  try {
    const account = await this.accountDAO.findByEmail(email);
    if (!account) {
      throw new ControllerError(AuthConstants.ERRORS.ACCOUNT_NOT_FOUND, 404);
    }

    if (account.isVerified) {
      throw new ControllerError(AuthConstants.ERRORS.ALREADY_VERIFIED, 400);
    }

    // Throttle: do not allow resending more than once every 60 seconds
    const COOLDOWN_SECONDS = 60;
    if (account.verificationTokenSentAt) {
      const last = new Date(account.verificationTokenSentAt).getTime();
      const elapsed = Math.floor((Date.now() - last) / 1000);
      if (elapsed < COOLDOWN_SECONDS) {
        const retryAfter = COOLDOWN_SECONDS - elapsed;
        return ResponseUtils.error(AuthConstants.ERRORS.RESEND_TOO_SOON, { retryAfter });
      }
    }

    const verificationToken = this.tokenGenerator.generateVerificationCode();
    let verificationMs;
    try {
      verificationMs = this.tokenGenerator.parseTimeToMs(common.constants.env.VERIFICATION_TOKEN_EXPIRES_IN);
    } catch (err) {
      console.error('Token expiry configuration error (VERIFICATION_TOKEN_EXPIRES_IN):', err);
      throw new ControllerError(AuthConstants.ERRORS.RESEND_VERIFICATION_FAILED);
    }
    const verificationTokenExpiry = this.tokenGenerator.getTokenExpiryMs(verificationMs);

    const now = new Date();
    await this.accountDAO.updateById(account._id, {
      verificationToken,
      verificationTokenExpiry,
      verificationTokenSentAt: now,
    });

    await this.emailAdapter.sendEmail(buildVerificationEmail(email, verificationToken));

    // Return the exact timestamp when the token was sent
    return ResponseUtils.success(AuthConstants.SUCCESS.VERIFICATION_RESENT, { tokenSentAt: now.toISOString() });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.RESEND_VERIFICATION_FAILED);
  }
}
