export { default as invoiceCalculator } from './invoice-calculator.util.js';
export { generateInvoiceEmailHTML } from './email-templates/invoice-email-template.util.js';
export { generateInvoiceNumber } from './invoice-number-generator.util.js';
export { sendInvoiceEmail } from './send-invoice-email.util.js';

import { prepareInvoiceItems } from './prepare-invoice-items.util.js';
import { calculateTax } from './calculate-tax.util.js';
import { getCustomerName } from './customer-name.util.js';
import { buildProductMeta } from './product-meta.util.js';
import { formatInvoice } from './format-invoice.util.js';
import { isValidUnitPrice, validateCommonInvoiceItem, validateServiceInvoiceItem, validateProductInvoiceItem, validateInvoiceItem, validateInvoiceItems } from './invoice-item-validation.util.js';
import { createInvoicePaymentToken, verifyInvoicePaymentToken } from './invoice-payment-token.util.js';
import { determineInvoiceEmailDecision } from './invoice-email-decision.util.js';
import { validateInvoiceCustomerEmail, getCustomerEmailFromContact } from './customer-email-validation.util.js';

export { prepareInvoiceItems };
export { calculateTax };
export { getCustomerName };
export { buildProductMeta };
export { formatInvoice };
export { isValidUnitPrice, validateCommonInvoiceItem, validateServiceInvoiceItem, validateProductInvoiceItem, validateInvoiceItem, validateInvoiceItems, createInvoicePaymentToken, verifyInvoicePaymentToken, determineInvoiceEmailDecision, validateInvoiceCustomerEmail, getCustomerEmailFromContact };

export const utils = {
  prepareInvoiceItems,
  calculateTax,
  getCustomerName,
  buildProductMeta,
  formatInvoice,
  isValidUnitPrice,
  validateCommonInvoiceItem,
  validateServiceInvoiceItem,
  validateProductInvoiceItem,
  validateInvoiceItem,
  validateInvoiceItems,
  createInvoicePaymentToken,
  verifyInvoicePaymentToken,
  determineInvoiceEmailDecision,
  validateInvoiceCustomerEmail,
  getCustomerEmailFromContact
};
