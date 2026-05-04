#!/usr/bin/env node

import assert from 'assert';
import { getInvoiceSummaryHandler } from '../modules/invoice/routes/handlers/getInvoiceSummaryHandler.js';

function makeRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (payload) {
    this.body = payload;
    return this;
  };
  return res;
}

async function testInvoiceSummaryReturnsTotals() {
  const req = { user: { accountId: 'merchant-123' } };
  const res = makeRes();

  const summary = {
    totalCount: 5,
    totalAmount: 3450,
    paidCount: 3,
    unpaidCount: 2,
    paidAmount: 2200,
    unpaidAmount: 1250,
    offlineCount: 1,
    onlineCount: 4,
  };

  const controller = {
    getInvoiceSummary: async (merchantId) => {
      assert.strictEqual(merchantId, 'merchant-123');
      return summary;
    },
  };

  await getInvoiceSummaryHandler(req, res, controller);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'success');
  assert.strictEqual(res.body.message, 'Invoice summary retrieved successfully');
  assert.deepStrictEqual(res.body.data, summary);
}

async function testInvoiceSummaryHandlesControllerError() {
  const req = { user: { accountId: 'merchant-123' } };
  const res = makeRes();
  const controller = {
    getInvoiceSummary: async () => {
      throw new Error('database failure');
    },
  };

  await getInvoiceSummaryHandler(req, res, controller);

  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.body.status, 'error');
  assert.strictEqual(res.body.message, 'database failure');
  assert.strictEqual(res.body.data, null);
}

async function run() {
  console.log('Running invoice summary endpoint verification...');

  await testInvoiceSummaryReturnsTotals();
  await testInvoiceSummaryHandlesControllerError();

  console.log('✅ Invoice summary endpoint verification passed');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Invoice summary verification failed', err);
  process.exit(1);
});
