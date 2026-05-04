import { ControllerError, DAOError } from '@common/errors.js';
import { getRouteErrorStatusCode } from '@common/utilities/route-error.util.js';

export async function processInvoicePaymentHandler(req, res, controller) {
  try {
    const payload = {
      invoiceNumber: req.body.invoiceNumber,
      transactionId: req.body.transactionId,
      status: req.body.status,
      metadata: req.body.metadata || {},
    };

    const result = await controller.processInvoicePayment(payload);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('processInvoicePaymentHandler error', error);

    if (error instanceof ControllerError || error instanceof DAOError) {
      return res.status(getRouteErrorStatusCode(error)).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: 'Failed to process invoice payment' });
  }
}
