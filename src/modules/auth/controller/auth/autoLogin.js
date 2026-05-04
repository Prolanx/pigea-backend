import { common } from "@common/_index.js";
import { constants } from "@modules/auth/constants/_index.js";
import { sanitizeAccount } from '@common/utilities/sanitizeAccount.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function autoLogin(email) {
  try {
    const account = await this.accountDAO.findByEmail(email);
    if (!account) {
      throw new ControllerError(AuthConstants.ERRORS.ACCOUNT_NOT_FOUND, 404);
    }

    if (!account.isVerified) {
      // Do not auto-login unverified accounts
      throw new ControllerError(AuthConstants.ERRORS.VERIFY_EMAIL_PROMPT, 400);
    }

    // Ensure the account has a still-valid refresh token recorded in DB.
    // Auto-login should only succeed if refresh token exists and isn't expired.
    const now = new Date();
    if (
      !account.refreshToken ||
      !account.refreshTokenExpiry ||
      account.refreshTokenExpiry <= now
    ) {
      // Treat as session expired — require full login
      throw new ControllerError(
        AuthConstants.ERRORS.REFRESH_TOKEN_EXPIRED ||
          AuthConstants.ERRORS.REFRESH_TOKEN_NOT_FOUND,
        401,
      );
    }

    // Generate an access token (no new refresh token issued for auto-login)
    const accessToken = this.jwtAdapter.generateAccessToken(
      { accountId: account._id, email: account.email, role: account.role },
      common.constants.env.JWT_ACCESS_SECRET,
      common.constants.env.JWT_ACCESS_EXPIRES_IN,
    );

    return ResponseUtils.success(AuthConstants.SUCCESS.LOGIN, {
      accessToken,
      account: sanitizeAccount(account),
    });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.LOGIN_FAILED);
  }
}
