#!/usr/bin/env node

import assert from 'assert';
import { getInvoiceByNumberHandler } from '../modules/invoice/routes/handlers/getInvoiceByNumberHandler.js';
import { getAllInvoicesHandler } from '../modules/invoice/routes/handlers/getAllInvoicesHandler.js';

function makeRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = function (code) { this.statusCode = code; return this; };
  res.json = function (payload) { this.body = payload; return this; };
  return res;
}

async function testInvoiceByNumberResponseIncludesIsOverdue() {
  const now = new Date();
  const future = new Date(now);
  future.setDate(now.getDate() + 5);

  const invoice = {
    _id: 'id-1',
    invoiceNumber: 'INV-200',
    dueDate: future,
    isOverdue: false,
  };

  const req = { query: { invoiceNumber: invoice.invoiceNumber } };
  const res = makeRes();
  const controller = { getInvoiceByNumber: async () => invoice };

  await getInvoiceByNumberHandler(req, res, controller);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.invoiceNumber, invoice.invoiceNumber);
  assert.strictEqual(res.body.data.isOverdue, false);
}

async function testInvoiceListResponseIncludesIsOverdue() {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - 5);

  const invoices = [
    {
      _id: 'id-2',
      invoiceNumber: 'INV-201',
      dueDate: past,
      isOverdue: true,
    },
  ];

  const req = { user: { accountId: 'merchant-1' } };
  const res = makeRes();
  const controller = { getAllInvoices: async () => invoices };

  await getAllInvoicesHandler(req, res, controller);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'success');
  assert.ok(Array.isArray(res.body.data));
  assert.strictEqual(res.body.data[0].invoiceNumber, invoices[0].invoiceNumber);
  assert.strictEqual(res.body.data[0].isOverdue, true);
}

async function run() {
  console.log('Running invoice endpoint isOverdue tests...');

  await testInvoiceByNumberResponseIncludesIsOverdue();
  await testInvoiceListResponseIncludesIsOverdue();

  console.log('✅ Invoice endpoint isOverdue tests passed');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Test failed', err);
  process.exit(1);
});
