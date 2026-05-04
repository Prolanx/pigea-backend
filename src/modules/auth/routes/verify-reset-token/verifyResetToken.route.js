import { common } from '@common/_index.js';
import { dto } from '@modules/auth/dto/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ResponseUtils } = common.utilities;
const { validateDto } = common.middleware;
const { ControllerError, DAOError } = common.errors;
const { verifyResetTokenDtoSchema } = dto;
const { AuthConstants } = constants;

export function verifyResetTokenRoute(router, controller) {
  router.post('/', validateDto(verifyResetTokenDtoSchema, AuthConstants.ERRORS.VERIFY_RESET_TOKEN_FAILED), async (req, res) => {
    try {
      const { token } = req.body;
      const result = await controller.verifyResetToken(token);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        return res.status(error.statusCode).json(ResponseUtils.error(error.message, null));
      }
      return res.status(500).json(ResponseUtils.error(AuthConstants.ERRORS.VERIFY_RESET_TOKEN_FAILED, null));
    }
  });
}
