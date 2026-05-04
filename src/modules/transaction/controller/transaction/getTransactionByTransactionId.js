import { ControllerError, DAOError } from '@common/errors.js';
import { buildTransactionResponse } from '@common/utilities/transaction-response.util.js';

export async function getTransactionByTransactionIdAction(controller, transactionId) {
  try {
    const transaction = await controller.transactionDAO.findByTransactionId(transactionId);

    if (!transaction) {
      return null;
    }

    let invoice = null;
    if (controller.invoiceDAO && transaction.invoiceId) {
      invoice = await controller.invoiceDAO.findById(transaction.invoiceId);
      if (invoice && controller.utils?.formatInvoice) {
        invoice = controller.utils.formatInvoice(invoice);
      }
    }

    return buildTransactionResponse({
      invoice,
      transaction,
      sentAt: null,
    });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError(`Failed to retrieve transaction: ${error.message}`);
  }
}
