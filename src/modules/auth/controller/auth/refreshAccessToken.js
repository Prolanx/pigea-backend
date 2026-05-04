import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ControllerError, DAOError } = common.errors;
const { ResponseUtils } = common.utilities;
const { AuthConstants } = constants;

export async function refreshAccessToken(refreshToken) {
  try {
    try {
      this.jwtAdapter.verifyToken(refreshToken, common.constants.env.JWT_REFRESH_SECRET);
    } catch (jwtError) {
      throw new ControllerError(AuthConstants.ERRORS.INVALID_REFRESH_TOKEN, 401);
    }

    const account = await this.accountDAO.findByRefreshToken(refreshToken);
    if (!account) {
      throw new ControllerError(AuthConstants.ERRORS.REFRESH_TOKEN_NOT_FOUND, 401);
    }

    const accessToken = this.jwtAdapter.generateAccessToken(
      { accountId: account._id, email: account.email, role: account.role },
      common.constants.env.JWT_ACCESS_SECRET,
      common.constants.env.JWT_ACCESS_EXPIRES_IN
    );

    return ResponseUtils.success(AuthConstants.SUCCESS.TOKEN_REFRESHED, { accessToken });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(AuthConstants.ERRORS.REFRESH_FAILED);
  }
}
