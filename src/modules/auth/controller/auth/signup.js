import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function signup(accountData) {
  try {
    const { email, password, firstName, lastName } = accountData;

    const existingAccount = await this.accountDAO.findByEmail(email);
    if (existingAccount) {
      throw new ControllerError(AuthConstants.ERRORS.EMAIL_EXISTS, 409);
    }

    const hashedPassword = await this.passwordAdapter.hashPassword(password);

    const verificationToken = this.tokenGenerator.generateVerificationCode();
    let verificationMs;
    try {
      verificationMs = this.tokenGenerator.parseTimeToMs(common.constants.env.VERIFICATION_TOKEN_EXPIRES_IN);
    } catch (err) {
      console.error('Token expiry configuration error (VERIFICATION_TOKEN_EXPIRES_IN):', err);
      throw new ControllerError(AuthConstants.ERRORS.SIGNUP_FAILED);
    }
    const verificationTokenExpiry = this.tokenGenerator.getTokenExpiryMs(verificationMs);

    const account = await this.accountDAO.createMerchantWithDefaults({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: AuthConstants.DEFAULTS.ROLE,
      verificationToken,
      verificationTokenExpiry,
      verificationTokenSentAt: new Date(),
      isVerified: false,
    });

    try {
      await this.emailAdapter.sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error(emailError);
    }

    return ResponseUtils.success(AuthConstants.SUCCESS.SIGNUP, {
      id: account._id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      role: account.role,
      verified: account.isVerified,
    });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.SIGNUP_FAILED);
  }
}
