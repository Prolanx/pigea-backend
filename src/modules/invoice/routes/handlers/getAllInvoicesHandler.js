import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function getAllInvoicesHandler(req, res, controller) {
  try {
    const merchantId = req.user.accountId;
    const invoices = await controller.getAllInvoices(merchantId);
    return res.status(200).json({
      status: 'success',
      message: 'Invoices retrieved successfully',
      data: invoices,
    });
  } catch (error) {
    return res.status(getRouteErrorStatusCode(error)).json({
      status: 'error',
      message: getRouteErrorMessage(error, 'Failed to retrieve invoices'),
      data: null,
    });
  }
}
