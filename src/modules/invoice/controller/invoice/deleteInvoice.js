import { ControllerError, DAOError } from '@common/errors.js';

export async function deleteInvoiceAction(controller, id, merchantId) {
  try {
    const exists = await controller.invoiceDAO.findByIdWithoutMerchantScope(id);
    if (!exists) {
      throw new ControllerError('Invoice not found', 404);
    }

    const rootId = exists.rootInvoiceId || exists._id;
    const res = await controller.invoiceDAO.deleteVersionsByRoot(rootId, merchantId);

    if (!res || res.deletedCount === 0) {
      throw new ControllerError('You do not have permission to delete this invoice', 403);
    }

    return controller.utils.formatInvoice(exists);
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to delete invoice');
  }
}
