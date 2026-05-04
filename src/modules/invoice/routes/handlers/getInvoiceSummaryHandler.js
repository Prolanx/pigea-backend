import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function getInvoiceSummaryHandler(req, res, controller) {
  try {
    const merchantId = req.user.accountId;
    const summary = await controller.getInvoiceSummary(merchantId);
    return res.status(200).json({
      status: 'success',
      message: 'Invoice summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    return res.status(getRouteErrorStatusCode(error)).json({
      status: 'error',
      message: getRouteErrorMessage(error, 'Failed to retrieve invoice summary'),
      data: null,
    });
  }
}
