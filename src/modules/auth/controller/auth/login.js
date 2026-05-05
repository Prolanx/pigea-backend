import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';
import { sanitizeAccount } from '@common/utilities/sanitizeAccount.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function login(email, password) {
  try {
    console.log("email address ", email)
    const account = await this.accountDAO.findByEmail(email);

    if (!account) {

        console.log(`Failed login attempt: Account not found`, account);
      throw new ControllerError(AuthConstants.ERRORS.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await this.passwordAdapter.comparePassword(password, account.password);
    if (!isPasswordValid) {
      console.log(`Failed login attempt for email: ${email} - Invalid password`);
      throw new ControllerError(AuthConstants.ERRORS.INVALID_CREDENTIALS, 401);
    }

    if (!account.isVerified) {
      const now = new Date();
      const tokenExpired = !account.verificationToken ||
        !account.verificationTokenExpiry ||
        account.verificationTokenExpiry <= now;

      if (tokenExpired) {
        const verificationToken = this.tokenGenerator.generateVerificationCode();
        let verificationMs;
        try {
          verificationMs = this.tokenGenerator.parseTimeToMs(common.constants.env.VERIFICATION_TOKEN_EXPIRES_IN);
        } catch (err) {
          console.error('Token expiry configuration error (VERIFICATION_TOKEN_EXPIRES_IN):', err);
          throw new ControllerError(AuthConstants.ERRORS.LOGIN_FAILED);
        }
        const verificationTokenExpiry = this.tokenGenerator.getTokenExpiryMs(verificationMs);

        await this.accountDAO.updateById(account._id, {
          verificationToken,
          verificationTokenExpiry,
          verificationTokenSentAt: new Date(),
        });

        await this.emailAdapter.sendVerificationEmail(email, verificationToken);

        return ResponseUtils.success(AuthConstants.ERRORS.VERIFICATION_EXPIRED, {
          requiresVerification: true,
          email: account.email,
        });
      }

      return ResponseUtils.success(AuthConstants.ERRORS.VERIFY_EMAIL_PROMPT, {
        requiresVerification: true,
        email: account.email,
      });
    }

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
      throw new ControllerError(AuthConstants.ERRORS.LOGIN_FAILED);
    }
    const refreshTokenExpiry = this.tokenGenerator.getTokenExpiryMs(refreshMs);
    await this.accountDAO.addRefreshToken(account._id, refreshToken, refreshTokenExpiry);

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
