import Counter from '@database/models/Counter.js';

/**
 * Generate next ticket number for a merchant conversation using atomic counter increment.
 * Uses the same Counter model as invoice number generation.
 * Counter key: "conversation_<merchantId>"
 *
 * @param {string} merchantId
 * @returns {Promise<string>} Formatted ticket number e.g. "TKT-9A2F-000042"
 * @throws {Error} If counter update fails
 */
export async function generateTicketNumber(merchantId) {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: `conversation_${merchantId}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const merchantPrefix = String(merchantId).slice(-4).toUpperCase();
    return `TKT-${merchantPrefix}-${String(counter.seq).padStart(6, '0')}`;
  } catch (error) {
    throw new Error(`Failed to generate ticket number: ${error.message}`);
  }
}
