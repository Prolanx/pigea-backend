#!/usr/bin/env node

import assert from 'assert';
import { getInvoiceByNumberHandler } from '../modules/invoice/routes/handlers/getInvoiceByNumberHandler.js';

function makeRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = function (code) { this.statusCode = code; return this; };
  res.json = function (payload) { this.body = payload; return this; };
  return res;
}

async function testMissingInvoiceNumber() {
  const req = { query: {} };
  const res = makeRes();

  await getInvoiceByNumberHandler(req, res, {});
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Invoice number is required');
}

async function testInvoiceNotFound() {
  const req = { query: { invoiceNumber: 'INV-999' } };
  const res = makeRes();
  const controller = { getInvoiceByNumber: async () => null };

  await getInvoiceByNumberHandler(req, res, controller);
  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.body, { success: true, data: null });
}

async function testInvoiceFoundAndExpired() {
  const now = new Date();
  const future = new Date(now);
  future.setDate(now.getDate() + 10);

  const invoice = {
    _id: 'id-1',
    invoiceNumber: 'INV-100',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    dueDate: future,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'sent',
    issueDate: now,
    updatedAt: now,
    createdAt: now,
  };

  const req = { query: { invoiceNumber: invoice.invoiceNumber } };
  const res = makeRes();
  const controller = { getInvoiceByNumber: async () => invoice };

  await getInvoiceByNumberHandler(req, res, controller);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.invoiceNumber, invoice.invoiceNumber);
  assert.strictEqual(res.body.data._id, invoice._id);
  assert.strictEqual(res.body.data.isOverdue, false);
}

async function testInvoiceFoundOverdueTrue() {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - 10);

  const invoice = {
    _id: 'id-2',
    invoiceNumber: 'INV-101',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    dueDate: past,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'unpaid',
    issueDate: now,
    updatedAt: now,
    createdAt: now,
  };

  const req = { query: { invoiceNumber: invoice.invoiceNumber } };
  const res = makeRes();
  const controller = { getInvoiceByNumber: async () => invoice };

  await getInvoiceByNumberHandler(req, res, controller);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.isOverdue, true);
}

async function run() {
  console.log('Running invoice decode unit tests...');

  await testMissingInvoiceNumber();
  await testInvoiceNotFound();
  await testInvoiceFoundAndExpired();
  await testInvoiceFoundOverdueTrue();

  console.log('✅ Invoice decode unit tests passed');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Test failed', err);
  process.exit(1);
});
