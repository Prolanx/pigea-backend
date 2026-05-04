import Counter from '@database/models/Counter.js';

/**
 * Generate next invoice number for a merchant using atomic counter increment
 * @param {string} merchantId - Merchant ID
 * @returns {Promise<string>} Formatted invoice number (e.g., "INV-9A2F-000001")
 * @throws {Error} If counter update fails
 */
export async function generateInvoiceNumber(merchantId) {
  try {
    // Atomically increment counter and return new value
    // upsert: true creates the counter if it doesn't exist (starts at 0, increments to 1)
    // new: true returns the updated document
    const counter = await Counter.findOneAndUpdate(
      { _id: `invoice_${merchantId}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Extract last 4 characters of merchantId as prefix (ensures global uniqueness)
    const merchantPrefix = merchantId.slice(-4).toUpperCase();

    // Format as INV-9A2F-000001, INV-9A2F-000002, etc.
    return `INV-${merchantPrefix}-${String(counter.seq).padStart(6, '0')}`;
  } catch (error) {
    throw new Error(`Failed to generate invoice number: ${error.message}`);
  }
}
