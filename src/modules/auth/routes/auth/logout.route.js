import { common } from '@common/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ResponseUtils } = common.utilities;
const { authenticateForLogout } = common.middleware;
const { ControllerError, DAOError } = common.errors;
const { AuthConstants } = constants;

export function logoutRoute(router, controller) {
  router.post('/logout', authenticateForLogout, async (req, res) => {
    try {
      const accountId = req.user.accountId;
      const result = await controller.logout(accountId);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        return res.status(error.statusCode).json(ResponseUtils.error(error.message, null));
      }
      return res.status(500).json(ResponseUtils.error(AuthConstants.ERRORS.LOGOUT_FAILED, null));
    }
  });
}
