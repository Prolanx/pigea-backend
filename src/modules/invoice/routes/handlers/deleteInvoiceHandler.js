import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function deleteInvoiceHandler(req, res, controller) {
  try {
    const merchantId = req.user.accountId;
    const deleted = await controller.deleteInvoice(req.params.id, merchantId);
    return res.status(200).json({
      status: 'success',
      message: 'Invoice deleted successfully',
      data: deleted,
    });
  } catch (error) {
    return res.status(getRouteErrorStatusCode(error)).json({
      status: 'error',
      message: getRouteErrorMessage(error, 'Failed to delete invoice'),
      data: null,
    });
  }
}
