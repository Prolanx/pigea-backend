import { common } from '@common/_index.js';
import { dto } from '@modules/auth/dto/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ResponseUtils } = common.utilities;
const { validateDto } = common.middleware;
const { ControllerError, DAOError } = common.errors;
const { resendVerificationDtoSchema } = dto;
const { AuthConstants } = constants;

export function resendVerificationRoute(router, controller) {
  router.post('/resend-verification', validateDto(resendVerificationDtoSchema, AuthConstants.ERRORS.RESEND_VERIFICATION_FAILED), async (req, res) => {
    try {
      const result = await controller.resendVerification(req.body.email);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        return res.status(error.statusCode).json(ResponseUtils.error(error.message, null));
      }
      return res.status(500).json(ResponseUtils.error(AuthConstants.ERRORS.RESEND_VERIFICATION_FAILED, null));
    }
  });
}
