export function buildTransactionResponse({ invoice, transaction, sentAt = null }) {
  const invoiceNumber = invoice?.invoiceNumber || transaction.invoiceNumber;
  const receipt = transaction.status === 'success'
    ? {
      transactionId: transaction.transactionId,
      invoiceNumber,
      sentAt,
      status: 'sent',
    }
    : null;

  const errorReceipt = transaction.status === 'failed'
    ? {
      transactionId: transaction.transactionId,
      invoiceNumber,
      sentAt,
      status: 'failed',
    }
    : null;

  return {
    invoice,
    transaction,
    receipt,
    errorReceipt,
  };
}
