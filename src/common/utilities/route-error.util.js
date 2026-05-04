import { ControllerError, DAOError } from '@common/errors.js';

export function getRouteErrorStatusCode(error) {
  return error?.statusCode || 500;
}

export function getRouteErrorMessage(error, defaultMessage) {
  if (error instanceof ControllerError || error instanceof DAOError) {
    return error.message;
  }
  return defaultMessage;
}
