/**
 * Invoice item validation utility (service-based rules)
 */

export function isValidUnitPrice(value) {
  const str = value?.toString?.() ?? '';
  if (str === '') return false;
  return /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(str);
}

export function validateCommonInvoiceItem(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('Invoice item must be an object');
  }

  const name = (item.name ?? item.product ?? '').toString().trim();
  if (!name) {
    throw new Error('Invoice item name is required');
  }

  const quantity = Number(item.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error('Invoice item quantity must be a non-negative number');
  }

  if (Number.isNaN(quantity) || !isFinite(quantity)) {
    throw new Error('Invoice item quantity must be a valid number');
  }

  if (item.quantity === '' || item.quantity === undefined || item.quantity === null) {
    throw new Error('Invoice item quantity is required');
  }

  if (!isValidUnitPrice(item.unitPrice)) {
    throw new Error('Invoice item unitPrice must be a numeric value with up to 2 decimals');
  }

  return true;
}

export function validateServiceInvoiceItem(item) {
  validateCommonInvoiceItem(item);

  if (item.productId) {
    throw new Error('Service invoice item cannot be linked to a productId');
  }

  if (item.itemCategory && item.itemCategory !== 'service') {
    throw new Error('Service invoice item must have itemCategory service');
  }

  return true;
}

export function validateProductInvoiceItem(item) {
  validateCommonInvoiceItem(item);

  if (!item.productId) {
    throw new Error('Product invoice item productId is required');
  }

  if (item.itemCategory && item.itemCategory !== 'product') {
    throw new Error('Product invoice item must have itemCategory product');
  }

  return true;
}

export function validateInvoiceItem(item, { invoiceCategory = 'service' } = {}) {
  if (invoiceCategory === 'product' || invoiceCategory === 'ecommerce') {
    return validateProductInvoiceItem(item);
  }
  return validateServiceInvoiceItem(item);
}

export function validateInvoiceItems(items = [], options = {}) {
  if (!Array.isArray(items)) {
    throw new Error('Invoice items must be an array');
  }

  if (items.length === 0) {
    throw new Error('Invoice must contain at least one item');
  }

  for (const item of items) {
    validateInvoiceItem(item, options);
  }

  return true;
}
