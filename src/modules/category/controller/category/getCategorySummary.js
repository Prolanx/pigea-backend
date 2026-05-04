import { ControllerError, DAOError } from '@common/errors.js';

export async function getCategorySummaryAction(controller, merchantId = null) {
  try {
    return await controller.categoryDAO.getCategorySummary(merchantId);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to retrieve category summary');
  }
}
