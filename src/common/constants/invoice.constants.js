// Invoice status and audit trail constants derived from schema enum contracts
export const INVOICE_STATUSES = ['draft', 'unpaid', 'paid', 'cancelled', 'refunded'];
export const INVOICE_STATUS_CREATE_OPTIONS = ['auto', 'draft'];
export const INVOICE_AUDIT_ACTIONS = ['drafted', 'sent', 're-sent', 'paid', 'cancelled', 'refunded'];
