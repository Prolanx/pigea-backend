import { getRouteErrorMessage, getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function createInvoiceHandler(req, res, controller) {
  try {
    const merchantId = req.user.accountId;
    const payload = { ...req.body, merchantId };
    const invoice = await controller.createInvoice(payload, merchantId);
    return res.status(201).json({
      status: 'success',
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    return res.status(getRouteErrorStatusCode(error)).json({
      status: 'error',
      message: getRouteErrorMessage(error, 'Failed to create invoice'),
      data: null,
    });
  }
}
