import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function logout(accountId) {
  try {
    await this.accountDAO.removeRefreshToken(accountId);
    return ResponseUtils.success(AuthConstants.SUCCESS.LOGOUT, null);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.LOGOUT_FAILED);
  }
}
