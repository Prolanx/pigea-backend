/**
 * Payment adapter (simulation mode)
 * This adapter returns the simulated transaction status based on env setting.
 */

export function verifyTransactionStatus(transactionId) {
  // transactionId is accepted to match the interface; for simulation it is not required
  const raw = (process.env.PAYMENT_SIMULATION_MODE || '').toLowerCase();
  if (raw === 'success' || raw === 'failed' || raw === 'pending') {
    return raw;
  }

  if (!raw) {
    throw new Error('PAYMENT_SIMULATION_MODE is required for payment simulation');
  }

  // If invalid value supplied, throw to enforce one of the valid simulation states.
  throw new Error('PAYMENT_SIMULATION_MODE must be one of success, failed, pending');
}
