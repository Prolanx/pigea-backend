import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function getInvoiceByIdHandler(req, res, controller) {
  try {
    const merchantId = req.user.accountId;
    const invoice = await controller.getInvoiceById(req.params.id, merchantId);

    if (invoice === null) {
      return res.status(200).json({
        status: 'success',
        message: 'The invoice does not exist or it may have been deleted',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Invoice retrieved successfully',
      data: invoice,
    });
  } catch (error) {
    return res.status(getRouteErrorStatusCode(error)).json({
      status: 'error',
      message: getRouteErrorMessage(error, 'Failed to retrieve invoice'),
      data: null,
    });
  }
}
