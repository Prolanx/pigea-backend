export function formatInvoice(invoice, formattedCustomer = undefined) {
  const customer = formattedCustomer !== undefined
    ? formattedCustomer
    : (invoice.customerId && typeof invoice.customerId === 'object' && invoice.customerId._id)
      ? invoice.customerId
      : null;

  const items = Array.isArray(invoice.items) ? invoice.items.map((i) => ({
    id: i._id?.toString?.() || i.id || null,
    productId: i.productId,
    itemCategory: i.itemCategory,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    total: i.total,
    durationHours: i.durationHours,
    repeatInterval: i.repeatInterval,
  })) : [];

  const statusHistory = Array.isArray(invoice.statusHistory) ? invoice.statusHistory.map((s) => ({
    status: s.status,
    changedAt: s.changedAt,
  })) : [];

  const auditTrail = Array.isArray(invoice.auditTrail) ? invoice.auditTrail.map((a) => ({
    action: a.action,
    changedAt: a.changedAt,
  })) : [];

  const now = new Date();
  const isOverdue = invoice.status === 'unpaid' && invoice.dueDate && new Date(invoice.dueDate) < now;
  const derivedStatus = isOverdue ? 'overdue' : invoice.status;

  return {
    id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    customerId: invoice.customerId ? (typeof invoice.customerId === 'object' ? invoice.customerId._id || invoice.customerId : invoice.customerId) : null,
    merchantId: invoice.merchantId ? (typeof invoice.merchantId === 'object' ? invoice.merchantId._id || invoice.merchantId : invoice.merchantId) : null,
    customer,
    customerName: invoice.customerName || null,
    customerEmail: invoice.customerEmail || null,
    invoiceCategory: invoice.invoiceCategory || null,
    currency: invoice.currency || null,
    orderId: invoice.orderId,
    productMeta: invoice.productMeta || null,
    fulfillmentStatus: invoice.productMeta?.fulfillmentStatus || null,
    items,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    status: derivedStatus,
    rawStatus: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    statusHistory,
    auditTrail,
    type: invoice.type,
    notes: invoice.notes,
    rootInvoiceId: invoice.rootInvoiceId,
    previousVersionId: invoice.previousVersionId,
    versionNumber: invoice.versionNumber,
    isLatest: invoice.isLatest,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
    isOverdue,
  };
}
