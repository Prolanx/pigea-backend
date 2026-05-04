/**
 * Invoice Calculation Utility
 * Handles all invoice-related calculations
 */
class InvoiceCalculator {
  /**
   * Calculate item total (quantity × unitPrice)
   * @param {Object} item - Invoice item
   * @returns {number} Item total
   */
  calculateItemTotal(item) {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    return quantity * unitPrice;
  }

  /**
   * Calculate items with their totals
   * @param {Array} items - Array of invoice items
   * @returns {Array} Items with calculated totals
   */
  calculateItemsTotals(items) {
    return items.map(item => ({
      ...item,
      total: this.calculateItemTotal(item)
    }));
  }

  /**
   * Calculate invoice subtotal (sum of all item totals)
   * @param {Array} items - Array of items with totals
   * @returns {number} Subtotal
   */
  calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  /**
   * Calculate invoice total (subtotal + tax)
   * @param {number} subtotal - Invoice subtotal
   * @param {number} tax - Tax amount
   * @returns {number} Total
   */
  calculateTotal(subtotal, tax = 0) {
    return subtotal + tax;
  }

  /**
   * Calculate all invoice totals
   * @param {Object} invoiceData - Raw invoice data
   * @returns {Object} Invoice data with calculated totals
   */
  calculateInvoiceTotals(invoiceData) {
    // Calculate each item's total
    const itemsWithTotals = this.calculateItemsTotals(invoiceData.items);

    // Calculate subtotal
    const subtotal = this.calculateSubtotal(itemsWithTotals);

    // Calculate total
    const tax = invoiceData.tax || 0;
    const total = this.calculateTotal(subtotal, tax);

    return {
      ...invoiceData,
      items: itemsWithTotals,
      subtotal,
      total
    };
  }
}

export default InvoiceCalculator;
