import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function updateInvoiceHandler(req, res, controller) {
  try {
    const merchantId = req.user.accountId;
    const invoice = await controller.updateInvoice(req.params.id, req.body, merchantId);
    return res.status(200).json({
      status: 'success',
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    return res.status(getRouteErrorStatusCode(error)).json({
      status: 'error',
      message: getRouteErrorMessage(error, 'Failed to update invoice'),
      data: null,
    });
  }
}
