import { common } from '@common/_index.js';
import { dto } from '@modules/auth/dto/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ResponseUtils } = common.utilities;
const { validateDto } = common.middleware;
const { ControllerError, DAOError } = common.errors;
const { resendResetCodeDtoSchema } = dto;
const { AuthConstants } = constants;

export function resendResetCodeRoute(router, controller) {
  router.post('/resend-reset-code', validateDto(resendResetCodeDtoSchema, AuthConstants.ERRORS.RESEND_RESET_CODE_FAILED), async (req, res) => {
    try {
      const result = await controller.resendResetCode(req.body.email);
      if (result.status === 'error') {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        return res.status(error.statusCode).json(ResponseUtils.error(error.message, null));
      }
      return res.status(500).json(ResponseUtils.error(AuthConstants.ERRORS.RESEND_RESET_CODE_FAILED, null));
    }
  });
}
