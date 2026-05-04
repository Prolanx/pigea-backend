import jwt from 'jsonwebtoken';
const TOKEN_SECRET = process.env.INVOICE_TOKEN_SECRET;

if (!TOKEN_SECRET) {
  throw new Error('INVOICE_TOKEN_SECRET is required for invoice payment token operations');
}

/**
 * Compose a payment token for an invoice email link.
 * @param {Object} payload - Minimal payload to identify invoice + user context
 * @param {string} payload.invoiceId
 * @param {string} payload.customerId
 * @param {string} payload.merchantId
 * @param {string} payload.invoiceNumber
 * @param {string} payload.currency
 * @param {string|Date} [payload.dueDate] - optional due date for expiry fallback
 * @param {Object} [options]
 * @param {string} [options.expiresIn] - optional JWT exp, defaults to payload.dueDate if set
 */
export function createInvoicePaymentToken(payload = {}, { expiresIn } = {}) {
  if (!payload.invoiceId || !payload.customerId || !payload.merchantId) {
    throw new Error('Payload must include invoiceId, customerId and merchantId');
  }

  const tokenPayload = {
    invoiceId: payload.invoiceId,
    customerId: payload.customerId,
    merchantId: payload.merchantId,
    currency: payload.currency || null,
    invoiceNumber: payload.invoiceNumber || null,
    issuedAt: new Date().toISOString(),
  };

  if (!expiresIn && payload.dueDate) {
    const dueDateTs = Math.floor(new Date(payload.dueDate).getTime() / 1000);
    const nowTs = Math.floor(Date.now() / 1000);

    if (Number.isFinite(dueDateTs)) {
      // expire based on due date; immediate expiry if due date already passed
      expiresIn = Math.max(1, dueDateTs - nowTs);
    }
  }

  const jwtOptions = {
    ...(expiresIn ? { expiresIn } : {}),
    issuer: 'bizflow-invoice-api',
  };

  return jwt.sign(tokenPayload, TOKEN_SECRET, jwtOptions);
}

/**
 * Verify and decode invoice payment token.
 * @param {string} token
 * @returns {Object} decoded token payload
 */
export function verifyInvoicePaymentToken(token) {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET, {
      issuer: 'bizflow-invoice-api',
    });
    return decoded;
  } catch (error) {
    throw new Error(`Invalid payment token: ${error.message}`);
  }
}
