import { ControllerError, DAOError } from '@common/errors.js';
import { getRouteErrorStatusCode, getRouteErrorMessage } from '@common/utilities/route-error.util.js';

export async function getInvoiceByNumberHandler(req, res, controller) {
  try {
    const invoiceNumber = req.query?.invoiceNumber;

    if (!invoiceNumber) {
      throw new ControllerError('Invoice number is required', 400);
    }

    const invoice = await controller.getInvoiceByNumber(invoiceNumber);

    if (!invoice) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    if (error instanceof ControllerError || error instanceof DAOError) {
      return res.status(getRouteErrorStatusCode(error)).json({ success: false, message: error.message });
    }
    console.error('Unexpected error in getInvoiceByNumberHandler:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve invoice by number' });
  }
}
