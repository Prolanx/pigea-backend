export function buildInvoiceReceiptData(invoice, transaction) {
  const taxRate = invoice.subtotal ? Number((invoice.tax / invoice.subtotal * 100).toFixed(2)) : 0;

  return {
    businessLogoUrl: process.env.BUSINESS_LOGO_URL || '',
    businessName: process.env.BUSINESS_NAME || 'BizFlow',
    businessEmail: process.env.BUSINESS_EMAIL || 'billing@bizflow.com',

    platformLogoUrl: process.env.PLATFORM_LOGO_URL || '',
    platformName: process.env.PLATFORM_NAME || 'BizFlow',
    platformSupportEmail: process.env.PLATFORM_SUPPORT_EMAIL || 'support@bizflow.com',

    invoiceNumber: invoice.invoiceNumber,
    paymentDate: new Date().toISOString().slice(0, 10),
    transactionId: transaction.transactionId,
    bankReference: transaction._id ? transaction._id.toString() : transaction.transactionId,

    customerName: invoice.customerName || invoice.customerEmail || 'Customer',
    customerEmail: invoice.customerEmail || 'no-reply@bizflow.com',

    items: invoice.items || [],
    subtotal: invoice.subtotal || 0,
    tax: invoice.tax || 0,
    taxRate,
    total: invoice.total || 0,
  };
}
