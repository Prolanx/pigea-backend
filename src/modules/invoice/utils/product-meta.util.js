import { generateOrderId } from './order-id.util.js';

export function buildProductMeta(invoiceData) {
  const fulfillmentStatus =
    invoiceData.fulfillmentStatus || invoiceData.productMeta?.fulfillmentStatus || null;
  let orderId = invoiceData.orderId || invoiceData.productMeta?.orderId || null;

  if (!orderId) {
    orderId = generateOrderId();
  }

  return {
    fulfillmentStatus,
    orderId,
  };
}
