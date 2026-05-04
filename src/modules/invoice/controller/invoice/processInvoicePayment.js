import { ControllerError, DAOError } from '@common/errors.js';
import { verifyTransactionStatus } from '@adapters/payment/payment.js';
import { sendEmail } from '@adapters/email/email.js';
import { buildInvoiceReceiptData } from '@modules/invoice/utils/build-receipt-data.util.js';
import { generateInvoiceReceiptTemplate } from '@modules/invoice/utils/email-templates/invoice-receipt-template.js';
import { buildInvoiceErrorReceiptData } from '@modules/invoice/utils/build-error-receipt-data.util.js';
import { generateInvoicePaymentErrorTemplate } from '@modules/invoice/utils/email-templates/invoice-payment-error-template.js';
import { buildTransactionResponse } from '@common/utilities/transaction-response.util.js';

export async function processInvoicePaymentAction(controller, paymentData) {
  const { invoiceNumber, transactionId, metadata = {} } = paymentData;

  if (!invoiceNumber || typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
    throw new ControllerError('invoiceNumber is required', 400);
  }
  if (!transactionId || typeof transactionId !== 'string' || !transactionId.trim()) {
    throw new ControllerError('transactionId is required', 400);
  }

  const effectiveStatus = verifyTransactionStatus(transactionId);


  try {
    const invoice = await controller.invoiceDAO.findByInvoiceNumber(invoiceNumber);
    if (!invoice) {
      throw new ControllerError('Invoice not found', 404);
    }

    const existingTransaction = await controller.transactionDAO.findByTransactionId(transactionId);
    if (existingTransaction) {
      throw new ControllerError('TransactionId already exists', 409);
    }

    const transaction = await controller.transactionDAO.create({
      transactionId,
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      merchantId: invoice.merchantId,
      customerId: invoice.customerId,
      amount: invoice.total,
      currency: invoice.currency || 'USD',
      status: effectiveStatus,
      metadata,
    });

    const invoiceStatus = effectiveStatus === 'success' ? 'paid' : invoice.status;

    let updatedInvoice = invoice;

    if (effectiveStatus === 'success') {
      const statusHistoryEntry = {
        status: invoiceStatus,
        changedAt: new Date(),
      };

      const auditEntry = {
        action: 'paid',
        changedAt: new Date()
      };

      updatedInvoice = await controller.invoiceDAO.updateById(invoice._id, {
        latestTransactionId: transaction.transactionId,
        status: invoiceStatus,
        statusHistory: [...(invoice.statusHistory || []), statusHistoryEntry],
        auditTrail: [...(invoice.auditTrail || []), auditEntry],
      });
    }

    let sentAt = null;

    if (effectiveStatus === 'success') {
      const receiptData = buildInvoiceReceiptData(updatedInvoice, transaction);
      const receiptHtml = generateInvoiceReceiptTemplate(receiptData);

      await sendEmail({
        to: updatedInvoice.customerEmail,
        subject: `Invoice ${updatedInvoice.invoiceNumber} Receipt`,
        text: `Your payment for invoice ${updatedInvoice.invoiceNumber} was successful.`,
        html: receiptHtml,
      });

      sentAt = new Date().toISOString();
    } else if (effectiveStatus === 'failed') {
      const errorData = buildInvoiceErrorReceiptData(updatedInvoice, transaction, 'Your payment could not be completed.');
      const errorHtml = generateInvoicePaymentErrorTemplate(errorData);

      await sendEmail({
        to: updatedInvoice.customerEmail,
        subject: `Invoice ${updatedInvoice.invoiceNumber} Payment Failed`,
        text: `Your payment for invoice ${updatedInvoice.invoiceNumber} failed.`,
        html: errorHtml,
      });

      sentAt = new Date().toISOString();
    }

    return buildTransactionResponse({
      invoice: controller.utils.formatInvoice(updatedInvoice),
      transaction,
      sentAt,
    });
  } catch (error) {
    if (error instanceof DAOError || error instanceof ControllerError) {
      throw error;
    }
    throw new ControllerError('Failed to process invoice payment');
  }
}
