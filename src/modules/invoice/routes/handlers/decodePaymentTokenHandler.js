import { ControllerError, DAOError } from '@common/errors.js';
import { getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function decodePaymentTokenHandler(req, res, controller) {
  try {
    const token = req.body?.token;

    if (!token) {
      throw new ControllerError('Token is required', 400);
    }

    const result = await controller.getInvoiceFromPaymentToken(token);

    const safetyData = {
      invoiceId: result.invoice._id,
      invoiceNumber: result.invoice.invoiceNumber,
      customerId: result.invoice.customerId,
      merchantId: result.invoice.merchantId,
      status: result.invoice.status,
      dueDate: result.invoice.dueDate,
      total: result.invoice.total,
      currency: result.invoice.currency,
    };

    return res.status(200).json({ success: true, data: safetyData });
  } catch (error) {
    if (error instanceof ControllerError || error instanceof DAOError) {
      return res.status(getRouteErrorStatusCode(error)).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Failed to decode payment token' });
  }
}
