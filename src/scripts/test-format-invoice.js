#!/usr/bin/env node

import assert from 'assert';
import { formatInvoice } from '../modules/invoice/utils/format-invoice.util.js';

function makeInvoice(overrides = {}) {
  const now = new Date();
  return {
    _id: 'invoice-id',
    invoiceNumber: 'INV-123',
    customerId: null,
    merchantId: null,
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    invoiceCategory: 'standard',
    currency: 'USD',
    orderId: 'order-1',
    productMeta: null,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'sent',
    issueDate: now,
    dueDate: now,
    statusHistory: [],
    auditTrail: [],
    type: 'standard',
    notes: null,
    rootInvoiceId: null,
    previousVersionId: null,
    versionNumber: 1,
    isLatest: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function testIsOverdueFalseForFutureDueDate() {
  const now = new Date();
  const future = new Date(now);
  future.setDate(now.getDate() + 5);

  const invoice = formatInvoice(makeInvoice({ dueDate: future }));

  assert.strictEqual(invoice.isOverdue, false);
}

function testIsOverdueTrueForPastDueDate() {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - 5);

  const invoice = formatInvoice(makeInvoice({ dueDate: past, status: 'unpaid' }));

  assert.strictEqual(invoice.isOverdue, true);
}

function testIsOverdueFalseWhenDueDateMissing() {
  const invoice = formatInvoice(makeInvoice({ dueDate: null }));

  assert.strictEqual(invoice.isOverdue, false);
}

async function run() {
  console.log('Running formatInvoice isOverdue unit tests...');

  testIsOverdueFalseForFutureDueDate();
  testIsOverdueTrueForPastDueDate();
  testIsOverdueFalseWhenDueDateMissing();

  console.log('✅ formatInvoice isOverdue unit tests passed');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Test failed', err);
  process.exit(1);
});
