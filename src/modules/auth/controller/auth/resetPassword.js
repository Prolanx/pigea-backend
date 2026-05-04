import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function resetPassword(resetData) {
  try {
    const { token, newPassword } = resetData;

    const accountWithToken = await this.accountDAO.findByPasswordResetTokenRaw(token);
    if (!accountWithToken) {
      throw new ControllerError(AuthConstants.ERRORS.INVALID_RESET_TOKEN, 400);
    }
    if (!accountWithToken.passwordResetTokenExpiry || accountWithToken.passwordResetTokenExpiry <= new Date()) {
      throw new ControllerError(AuthConstants.ERRORS.RESET_TOKEN_EXPIRED, 400);
    }

    const hashedPassword = await this.passwordAdapter.hashPassword(newPassword);

    await this.accountDAO.updateById(accountWithToken._id, {
      password: hashedPassword,
    });
    await this.accountDAO.clearPasswordResetToken(accountWithToken._id);
    await this.accountDAO.removeRefreshToken(accountWithToken._id);

    return ResponseUtils.success(AuthConstants.SUCCESS.PASSWORD_RESET, null);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.RESET_PASSWORD_FAILED);
  }
}
