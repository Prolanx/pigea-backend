import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function verifyResetToken(token) {
  try {
    const account = await this.accountDAO.findByPasswordResetTokenRaw(token);
    if (!account) {
      throw new ControllerError(AuthConstants.ERRORS.INVALID_RESET_TOKEN, 400);
    }
    if (!account.passwordResetTokenExpiry || account.passwordResetTokenExpiry <= new Date()) {
      throw new ControllerError(AuthConstants.ERRORS.RESET_TOKEN_EXPIRED, 400);
    }
    return ResponseUtils.success(AuthConstants.SUCCESS.RESET_TOKEN_VALID, null);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.VERIFY_RESET_TOKEN_FAILED);
  }
}
