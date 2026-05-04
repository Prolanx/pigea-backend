import { constants } from '@common/constants/_index.js';

/**
 * Shared decision helper for invoice email/send behavior.
 *
 * This utility centralizes the rule that `auto` means the invoice should be sent,
 * whether on create or on draft update, and uses the same accepted values as
 * the invoice schema / constants.
 */
export function determineInvoiceEmailDecision({ requestStatus: clientRequestStatus, currentStatus = null, isCreation = false }) {
  // Normalize the client-provided status so the helper works consistently regardless
  // of casing or whether the caller passes null/undefined.
  const normalizedClientRequestStatus = clientRequestStatus ? String(clientRequestStatus).toLowerCase() : null;

  // Validate against the allowed create/update status values.
  if (normalizedClientRequestStatus && !constants.invoice.INVOICE_STATUS_CREATE_OPTIONS.includes(normalizedClientRequestStatus)) {
    throw new Error(`Status must be one of: ${constants.invoice.INVOICE_STATUS_CREATE_OPTIONS.join(', ')}`);
  }

  const isAutoClientRequest = normalizedClientRequestStatus === 'auto';
  const isDraftClientRequest = normalizedClientRequestStatus === 'draft';

  if (isCreation) {
    // Creation-specific logic is handled here and returned immediately.
    const normalizedStatus = isAutoClientRequest ? 'unpaid' : 'draft';
    const statusHistoryEntry = normalizedStatus !== currentStatus
      ? { status: normalizedStatus, changedAt: new Date() }
      : null;

    const auditAction = isAutoClientRequest
      ? 'sent'
      : 'drafted';

    if (auditAction && !constants.invoice.INVOICE_AUDIT_ACTIONS.includes(auditAction)) {
      throw new Error(`Audit action must be one of: ${constants.invoice.INVOICE_AUDIT_ACTIONS.join(', ')}`);
    }

    return {
      normalizedStatus,
      statusHistoryEntry,
      auditAction,
      shouldSendInvoiceEmail: isAutoClientRequest
    };
  }

  // Non-creation flow: preserve current status unless explicitly changed.
  const isDraftUpdate = currentStatus === 'draft';
  let normalizedStatus = currentStatus;
  if (isAutoClientRequest) {
    normalizedStatus = 'unpaid';
  } else if (isDraftClientRequest) {
    normalizedStatus = 'draft';
  }

  const statusHistoryEntry = normalizedStatus !== currentStatus
    ? { status: normalizedStatus, changedAt: new Date() }
    : null;

  let auditAction = null;
  if (isAutoClientRequest) {
    auditAction = 'sent';
  } else if (isDraftClientRequest) {
    auditAction = 'drafted';
  } else if (isDraftUpdate) {
    // If this invoice is already draft and the client did not explicitly change status,
    // treat it as a draft edit.
    auditAction = 'drafted';
  }

  if (auditAction && !constants.invoice.INVOICE_AUDIT_ACTIONS.includes(auditAction)) {
    throw new Error(`Audit action must be one of: ${constants.invoice.INVOICE_AUDIT_ACTIONS.join(', ')}`);
  }

  return {
    normalizedStatus,
    statusHistoryEntry,
    auditAction,
    shouldSendInvoiceEmail: isAutoClientRequest
  };
}
