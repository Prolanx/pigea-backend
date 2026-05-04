import { ControllerError, DAOError } from '@common/errors.js';

export async function getInvoiceFromPaymentToken(controller, token) {
  try {
    if (!token) throw new ControllerError('Payment token is required', 400);

    const decoded = controller.utils.verifyInvoicePaymentToken(token);

    // Fetch invoice for extra validation and context
    const invoice = await controller.invoiceDAO.findById(decoded.invoiceId);
    if (!invoice) {
      throw new ControllerError('Invoice not found', 404);
    }

    if (!invoice.isLatest) {
      throw new ControllerError('Invoice version is not current', 400);
    }

    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      throw new ControllerError('Invoice cannot be paid (already completed)', 400);
    }

    if (String(invoice.merchantId) !== String(decoded.merchantId) || String(invoice.customerId) !== String(decoded.customerId)) {
      throw new ControllerError('Token does not match invoice context', 403);
    }

    return {
      invoice,
      decodedToken: decoded
    };
  } catch (error) {
    if (error instanceof ControllerError || error instanceof DAOError) {
      throw error;
    }
    throw new ControllerError('Failed to process payment token');
  }
}
