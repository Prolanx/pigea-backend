export function buildInvoiceErrorReceiptData(invoice, transaction, errorMessage) {
  return {
    businessLogoUrl: process.env.BUSINESS_LOGO_URL || '',
    businessName: process.env.BUSINESS_NAME || 'BizFlow',
    businessEmail: process.env.BUSINESS_EMAIL || 'billing@bizflow.com',
    businessSupportEmail: process.env.BUSINESS_SUPPORT_EMAIL || 'support@bizflow.com',
    merchantSupportUrl: process.env.MERCHANT_SUPPORT_URL || 'https://bizflow.com/support',

    platformLogoUrl: process.env.PLATFORM_LOGO_URL || '',
    platformName: process.env.PLATFORM_NAME || 'BizFlow',
    platformSupportEmail: process.env.PLATFORM_SUPPORT_EMAIL || 'support@bizflow.com',

    invoiceNumber: invoice.invoiceNumber,
    total: invoice.total || 0,

    customerName: invoice.customerName || invoice.customerEmail || 'Customer',
    customerEmail: invoice.customerEmail || 'no-reply@bizflow.com',

    errorMessage,
  };
}
