import { common } from '@common/_index.js';
import { dto } from '@modules/auth/dto/_index.js';
import { constants } from '@modules/auth/constants/_index.js';

const { ResponseUtils } = common.utilities;
const { validateDto } = common.middleware;
const { ControllerError, DAOError } = common.errors;
const { signupDtoSchema } = dto;
const { AuthConstants } = constants;

export function signupRoute(router, controller) {
  router.post('/signup', validateDto(signupDtoSchema, AuthConstants.ERRORS.SIGNUP_FAILED), async (req, res) => {
    try {
      const result = await controller.signup(req.body);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        return res.status(error.statusCode).json(ResponseUtils.error(error.message, null));
      }
      return res.status(500).json(ResponseUtils.error(AuthConstants.ERRORS.SIGNUP_FAILED, null));
    }
  });
}
