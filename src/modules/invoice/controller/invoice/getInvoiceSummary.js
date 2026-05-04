import { ControllerError, DAOError } from '@common/errors.js';

export async function getInvoiceSummaryAction(controller, merchantId = null) {
  try {
    return await controller.invoiceDAO.getInvoiceSummary(merchantId);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to retrieve invoice summary');
  }
}
