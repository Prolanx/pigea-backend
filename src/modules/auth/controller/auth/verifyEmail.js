import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';
import { sanitizeAccount } from '@common/utilities/sanitizeAccount.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function verifyEmail(token) {
  try {
    // find a non-expired token first
    const account = await this.accountDAO.findByVerificationToken(token);
    if (!account) {
      // token might exist but be expired — check the raw record so we can distinguish
      const accountRaw = await this.accountDAO.findByVerificationTokenRaw(token);
      const now = new Date();

      if (accountRaw && accountRaw.verificationTokenExpiry && accountRaw.verificationTokenExpiry <= now) {
        throw new ControllerError(AuthConstants.ERRORS.VERIFICATION_TOKEN_EXPIRED, 400);
      }

      // otherwise treat as invalid token
      throw new ControllerError(AuthConstants.ERRORS.INVALID_VERIFICATION_TOKEN, 400);
    }

    await this.accountDAO.updateById(account._id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });

    const accessToken = this.jwtAdapter.generateAccessToken(
      { accountId: account._id, email: account.email, role: account.role },
      common.constants.env.JWT_ACCESS_SECRET,
      common.constants.env.JWT_ACCESS_EXPIRES_IN
    );

    const refreshToken = this.jwtAdapter.generateRefreshToken(
      { accountId: account._id },
      common.constants.env.JWT_REFRESH_SECRET,
      common.constants.env.JWT_REFRESH_EXPIRES_IN
    );

    let refreshMs;
    try {
      refreshMs = this.tokenGenerator.parseTimeToMs(common.constants.env.JWT_REFRESH_EXPIRES_IN);
    } catch (err) {
      console.error('Token expiry configuration error (JWT_REFRESH_EXPIRES_IN):', err);
      throw new ControllerError(AuthConstants.ERRORS.VERIFY_EMAIL_FAILED);
    }
    const refreshTokenExpiry = this.tokenGenerator.getTokenExpiryMs(refreshMs);
    await this.accountDAO.addRefreshToken(account._id, refreshToken, refreshTokenExpiry);

    return ResponseUtils.success(AuthConstants.SUCCESS.EMAIL_VERIFIED, {
      accessToken,
      account: sanitizeAccount(account),
    });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.VERIFY_EMAIL_FAILED);
  }
}
