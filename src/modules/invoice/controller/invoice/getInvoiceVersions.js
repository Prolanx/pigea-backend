import { ControllerError, DAOError } from '@common/errors.js';

export async function getInvoiceVersionsAction(controller, id) {
  try {
    const invoice = await controller.invoiceDAO.findByIdWithoutMerchantScope(id);
    if (!invoice) {
      return null;
    }

    const rootId = invoice.rootInvoiceId || invoice._id;
    const versions = await controller.invoiceDAO.findVersionsByRoot(rootId);

    return versions.map((v) => ({
      id: v._id,
      invoiceNumber: v.invoiceNumber,
      versionNumber: v.versionNumber,
      previousVersionId: v.previousVersionId,
      status: v.status,
    }));
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to retrieve invoice versions');
  }
}
