import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function updateInvoiceStatusHandler(req, res, controller) {
  try {
    const merchantId = req.user.accountId;
    const invoice = await controller.updateInvoiceStatus(req.params.id, req.body.status, merchantId);
    return res.status(200).json({
      status: 'success',
      message: 'Invoice status updated successfully',
      data: invoice,
    });
  } catch (error) {
    return res.status(getRouteErrorStatusCode(error)).json({
      status: 'error',
      message: getRouteErrorMessage(error, 'Failed to update invoice status'),
      data: null,
    });
  }
}
