#!/usr/bin/env node
/*
  Backend invoice validation unit tests (service-based)

  Run:
    node scripts/test-invoice-validation.js
*/

process.env.INVOICE_TOKEN_SECRET = process.env.INVOICE_TOKEN_SECRET || 'secret123';
import assert from 'assert';
import nodemailer from 'nodemailer';
import {
  isValidUnitPrice,
  validateCommonInvoiceItem,
  validateServiceInvoiceItem,
  validateProductInvoiceItem,
  validateInvoiceItem,
  validateInvoiceItems
} from '../modules/invoice/utils/invoice-item-validation.util.js';
import {
  buildProductMeta
} from '../modules/invoice/utils/product-meta.util.js';
import {
  formatInvoice
} from '../modules/invoice/utils/format-invoice.util.js';
import {
  createInvoicePaymentToken,
  verifyInvoicePaymentToken
} from '../modules/invoice/utils/invoice-payment-token.util.js';
import { determineInvoiceEmailDecision } from '../modules/invoice/utils/invoice-email-decision.util.js';
import {
  STATUS_TRANSITIONS,
  shouldTriggerEmail
} from '../modules/invoice/controller/invoice/updateInvoiceStatus.js';
import InvoiceCalculator from '../modules/invoice/utils/invoice-calculator.util.js';
import { prepareInvoiceItems } from '../modules/invoice/utils/prepare-invoice-items.util.js';
import { updateInvoiceAction } from '../modules/invoice/controller/invoice/updateInvoice.js';
import { processInvoicePaymentAction } from '../modules/invoice/controller/invoice/processInvoicePayment.js';

function testUnitPrice() {
  assert.strictEqual(isValidUnitPrice('10'), true);
  assert.strictEqual(isValidUnitPrice('0'), true);
  assert.strictEqual(isValidUnitPrice('0.00'), true);
  assert.strictEqual(isValidUnitPrice('10.1'), true);
  assert.strictEqual(isValidUnitPrice('10.12'), true);
  assert.strictEqual(isValidUnitPrice('10.123'), false);
  assert.strictEqual(isValidUnitPrice(''), false);
  assert.strictEqual(isValidUnitPrice('03'), false);
  assert.strictEqual(isValidUnitPrice('-1'), false);
}

function testValidateInvoiceItem() {
  const item = { name: 'Consulting', quantity: 2, unitPrice: '12.50', itemCategory: 'service' };
  assert.strictEqual(validateInvoiceItem(item, { invoiceCategory: 'service' }), true);

  assert.throws(() => validateInvoiceItem({ quantity: 1, unitPrice: '12.50' }, { invoiceCategory: 'service' }), /Invoice item name is required/);
  assert.throws(() => validateInvoiceItem({ name: 'Foo', quantity: -1, unitPrice: '12.50' }, { invoiceCategory: 'service' }), /non-negative number/);
  assert.throws(() => validateInvoiceItem({ name: 'Bar', quantity: 1, unitPrice: '12.345' }, { invoiceCategory: 'service' }), /unitPrice must be a numeric value with up to 2 decimals/);
  assert.throws(() => validateInvoiceItem({ name: 'Baz', quantity: 1, unitPrice: '12.00', productId: 'prod1' }, { invoiceCategory: 'service' }), /Service invoice item cannot be linked to a productId/);
  assert.strictEqual(validateServiceInvoiceItem(item), true);
  assert.strictEqual(validateProductInvoiceItem({name:'Widget',quantity:1,unitPrice:'20.00',productId:'p1',itemCategory:'product'}), true);

  assert.throws(() => validateProductInvoiceItem({ name:'Widget',quantity:1,unitPrice:'20.00' }), /productId is required/);
}

function testValidateInvoiceItems() {
  const items = [
    { name: 'Consulting', quantity: 1, unitPrice: '100.00', itemCategory: 'service' },
    { name: 'Support', quantity: 2, unitPrice: '75.00', itemCategory: 'service' }
  ];
  assert.strictEqual(validateInvoiceItems(items, { invoiceCategory: 'service' }), true);

  assert.throws(() => validateInvoiceItems([], {}), /at least one item/);
  assert.throws(() => validateInvoiceItems(null, {}), /items must be an array/);
}

function testInvoicePaymentTokenExpiry() {
  const dueDate = new Date(Date.now() + 1000 * 2); // 2 seconds future
  const token = createInvoicePaymentToken({
    invoiceId: 'inv1',
    customerId: 'c1',
    merchantId: 'm1',
    invoiceNumber: 'INV-0001',
    currency: 'USD',
    dueDate,
  });

  const decoded = verifyInvoicePaymentToken(token);
  assert.strictEqual(decoded.invoiceId, 'inv1');
  assert.strictEqual(decoded.customerId, 'c1');

  // Wait for expiry
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  return wait(3000).then(() => {
    assert.throws(() => verifyInvoicePaymentToken(token), /jwt expired/);
  });
}

function testInvoicePaymentTokenInvalid() {
  assert.throws(
    () => verifyInvoicePaymentToken('invalid.token.value'),
    /invalid payment token/i,
  );
}

function testStatusTransitionHelpers() {
  assert.deepStrictEqual(STATUS_TRANSITIONS.new, ['sent', 'cancelled']);
  assert.deepStrictEqual(STATUS_TRANSITIONS.sent, ['re-issued', 'paid', 'cancelled']);
  assert.deepStrictEqual(STATUS_TRANSITIONS.overdue, ['re-issued', 'cancelled']);
  assert.deepStrictEqual(STATUS_TRANSITIONS['re-issued'], ['paid', 'cancelled']);
  assert.deepStrictEqual(STATUS_TRANSITIONS.paid, []);
  assert.deepStrictEqual(STATUS_TRANSITIONS.cancelled, []);

  assert.strictEqual(shouldTriggerEmail('sent'), true);
  assert.strictEqual(shouldTriggerEmail('re-issued'), true);
  assert.strictEqual(shouldTriggerEmail('new'), false);
  assert.strictEqual(shouldTriggerEmail('overdue'), false);
  assert.strictEqual(shouldTriggerEmail('paid'), false);
  assert.strictEqual(shouldTriggerEmail('cancelled'), false);
}

async function testProductPrepareInvoiceItems() {
  const product = { _id: 'p1', name: 'Widget', price: 20.0 };
  const productDAO = {
    findById: async (id, merchantId) => (id === 'p1' ? product : null)
  };

  const items = [
    { productId: 'p1', quantity: 2, unitPrice: '20.00' },
    { name: 'Service', quantity: 1, unitPrice: '50.00', itemCategory: 'service' }
  ];

  const normalized = await prepareInvoiceItems(items, 'm1', productDAO);
  assert.strictEqual(normalized[0].name, 'Widget');
  assert.strictEqual(normalized[0].unitPrice, 20.0);
  assert.strictEqual(normalized[0].itemCategory, 'product');

  await assert.rejects(
    () => prepareInvoiceItems([{ productId: 'p1', quantity: 1, unitPrice: '21.00' }], 'm1', productDAO),
    /Unit price mismatch/
  );

  await assert.rejects(
    () => prepareInvoiceItems([{ productId: 'unknown', quantity: 1, unitPrice: '10.00' }], 'm1', productDAO),
    /Product not found/
  );
}

function testProductMetaBehavior() {
  const meta = buildProductMeta({ fulfillmentStatus: 'pending', orderId: 'ORDER-123' });
  assert.strictEqual(meta.checkoutEmail, undefined);
  assert.strictEqual(meta.fulfillmentStatus, 'pending');
  assert.strictEqual(meta.orderId, 'ORDER-123');

  const formatted = formatInvoice({
    _id: 'inv1',
    customerSnapshot: [],
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    invoiceCategory: 'ecommerce',
    currency: 'USD',
    orderId: 'ORDER-123',
    productMeta: { fulfillmentStatus: 'pending', orderId: 'ORDER-123' },
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    issueDate: new Date(),
    dueDate: new Date(),
    statusHistory: []
  });

  assert.strictEqual(formatted.checkoutEmail, undefined);
  assert.strictEqual(formatted.fulfillmentStatus, 'pending');
}


function testInvoiceCalculatorTotals() {
  const calc = new InvoiceCalculator();
  const invoiceData = { items: [ { name: 'Consulting', quantity: 2, unitPrice: 100 }, { name: 'Delivery service', quantity: 1, unitPrice: 20 } ], tax: 18 };
  const result = calc.calculateInvoiceTotals(invoiceData);

  assert.strictEqual(result.items.length, 2);
  assert.strictEqual(result.subtotal, 220);
  assert.strictEqual(result.total, 238);
}

async function testUpdateInvoiceDraftInPlace() {
  let updatedInvoiceRecord = null;

  const exists = {
    _id: 'inv1',
    merchantId: 'm1',
    status: 'draft',
    statusHistory: [{ status: 'draft', changedAt: new Date('2026-01-01') }],
    auditTrail: [],
    items: [{ name: 'Service', quantity: 1, unitPrice: 100 }],
    customerName: 'Jane',
    customerEmail: 'jane@example.com',
    invoiceCategory: 'service',
    currency: 'USD',
    subtotal: 100,
    tax: 0,
    total: 100,
    issueDate: new Date('2026-01-01'),
    dueDate: new Date('2026-02-01'),
    isLatest: true,
  };

  const controller = {
    invoiceDAO: {
      findByIdWithoutMerchantScope: async (id) => (id === exists._id ? exists : null),
      updateByIdWithMerchantScope: async (id, merchantId, updateData) => {
        if (id !== exists._id || merchantId !== 'm1') {
          throw new Error('unexpected invoice update call');
        }
        updatedInvoiceRecord = { ...exists, ...updateData };
        return updatedInvoiceRecord;
      },
    },
    accountDAO: {
      findById: async () => ({ businessInfo: { billingCurrency: 'USD', taxEnabled: false, taxRate: 0 } }),
    },
    productDAO: {},
    utils: {
      validateInvoiceItems,
      prepareInvoiceItems: async (items) => items,
      formatInvoice: (invoice) => invoice,
    },
    invoiceCalculator: new InvoiceCalculator(),
    emailAdapter: {},
    transactionDAO: {},
  };

  const result = await updateInvoiceAction(controller, exists._id, { notes: 'Updated notes for the invoice' }, 'm1');

  assert.strictEqual(result.notes, 'Updated notes for the invoice');
  assert.strictEqual(result.status, 'draft');
  assert.strictEqual(result.auditTrail.length, 1);
  assert.strictEqual(result.auditTrail[0].action, 'drafted');
  assert.strictEqual(result.statusHistory.length, 1);

  assert.strictEqual(updatedInvoiceRecord.notes, 'Updated notes for the invoice');
}

function testDetermineInvoiceEmailDecision() {
  const draftCreation = determineInvoiceEmailDecision({ requestStatus: 'draft', isCreation: true });
  assert.strictEqual(draftCreation.normalizedStatus, 'draft');
  assert.strictEqual(draftCreation.auditAction, 'drafted');
  assert.strictEqual(draftCreation.shouldSendInvoiceEmail, false);
  assert.strictEqual(draftCreation.statusHistoryEntry, null);

  const autoCreation = determineInvoiceEmailDecision({ requestStatus: 'auto', isCreation: true });
  assert.strictEqual(autoCreation.normalizedStatus, 'unpaid');
  assert.strictEqual(autoCreation.auditAction, 'sent');
  assert.strictEqual(autoCreation.shouldSendInvoiceEmail, true);
  assert.ok(autoCreation.statusHistoryEntry);

  const draftUpdate = determineInvoiceEmailDecision({ requestStatus: null, currentStatus: 'draft', isCreation: false });
  assert.strictEqual(draftUpdate.normalizedStatus, 'draft');
  assert.strictEqual(draftUpdate.auditAction, 'drafted');
  assert.strictEqual(draftUpdate.shouldSendInvoiceEmail, false);
  assert.strictEqual(draftUpdate.statusHistoryEntry, null);

  const autoUpdate = determineInvoiceEmailDecision({ requestStatus: 'auto', currentStatus: 'draft', isCreation: false });
  assert.strictEqual(autoUpdate.normalizedStatus, 'unpaid');
  assert.strictEqual(autoUpdate.auditAction, 'sent');
  assert.strictEqual(autoUpdate.shouldSendInvoiceEmail, true);
  assert.ok(autoUpdate.statusHistoryEntry);
}

async function testUpdateInvoiceDraftToAutoTransition() {
  const exists = {
    _id: 'inv2',
    merchantId: 'm1',
    status: 'draft',
    statusHistory: [{ status: 'draft', changedAt: new Date('2026-01-01') }],
    auditTrail: [],
    items: [{ name: 'Consulting', quantity: 2, unitPrice: 100 }],
    customerName: 'John',
    customerEmail: 'john@example.com',
    invoiceCategory: 'service',
    currency: 'USD',
    subtotal: 200,
    tax: 0,
    total: 200,
    issueDate: new Date('2026-01-01'),
    dueDate: new Date('2026-02-01'),
    isLatest: true,
  };

  let updatedInvoiceRecord = null;

  const controller = {
    invoiceDAO: {
      findByIdWithoutMerchantScope: async (id) => (id === exists._id ? exists : null),
      updateByIdWithMerchantScope: async (id, merchantId, updateData) => {
        updatedInvoiceRecord = { ...exists, ...updateData };
        return updatedInvoiceRecord;
      },
    },
    accountDAO: {
      findById: async () => ({ businessInfo: { billingCurrency: 'USD', taxEnabled: false, taxRate: 0 } }),
    },
    productDAO: {},
    utils: {
      validateInvoiceItems,
      prepareInvoiceItems: async (items) => items,
      formatInvoice: (invoice) => invoice,
    },
    invoiceCalculator: new InvoiceCalculator(),
    emailAdapter: {},
    transactionDAO: {},
  };

  const result = await updateInvoiceAction(controller, exists._id, { notes: 'Auto transition', status: 'auto' }, 'm1');

  assert.strictEqual(result.status, 'unpaid');
  assert.strictEqual(result.statusHistory.length, 2);
  assert.strictEqual(result.statusHistory[1].status, 'unpaid');
  assert.strictEqual(result.auditTrail.length, 1);
  assert.strictEqual(result.auditTrail[0].action, 'sent');
  assert.strictEqual(result.notes, 'Auto transition');
}

async function testProcessInvoicePaymentFailureDoesNotMutateInvoice() {
  const realCreateTransport = nodemailer.createTransport;
  nodemailer.createTransport = () => ({ sendMail: async () => ({}) });

  try {
    const invoice = {
      _id: 'inv3',
      invoiceNumber: 'INV-003',
      merchantId: 'm1',
      customerId: 'c1',
      customerEmail: 'customer@example.com',
      status: 'unpaid',
      statusHistory: [{ status: 'unpaid', changedAt: new Date('2026-01-01') }],
      auditTrail: [],
      total: 100,
      currency: 'USD',
    };

    let updatedInvoiceRecord = null;

    const controller = {
      invoiceDAO: {
        findByInvoiceNumber: async (invoiceNumber) => (invoiceNumber === invoice.invoiceNumber ? invoice : null),
        updateById: async (id, updateData) => {
          updatedInvoiceRecord = { ...invoice, ...updateData };
          return updatedInvoiceRecord;
        },
      },
      transactionDAO: {
        findByTransactionId: async () => null,
        create: async (transactionData) => transactionData,
      },
      contactDAO: {},
      utils: {
        formatInvoice: (invoiceData) => invoiceData,
      },
    };

    const result = await processInvoicePaymentAction(controller, {
      invoiceNumber: invoice.invoiceNumber,
      transactionId: 'tx-fail',
      metadata: {}
    });

    assert.strictEqual(result.transaction.status, 'failed');
    assert.strictEqual(result.invoice.status, 'unpaid');
    assert.strictEqual(updatedInvoiceRecord.latestTransactionId, 'tx-fail');
    assert.strictEqual(updatedInvoiceRecord.status, 'unpaid');
    assert.deepStrictEqual(updatedInvoiceRecord.statusHistory, invoice.statusHistory);
    assert.deepStrictEqual(updatedInvoiceRecord.auditTrail, invoice.auditTrail);
    assert.strictEqual(result.receipt, null);
    assert.strictEqual(result.errorReceipt.status, 'failed');
  } finally {
    nodemailer.createTransport = realCreateTransport;
  }
}

async function run() {
  console.log('Running invoice validation unit tests...');

  await testUnitPrice();
  await testValidateInvoiceItem();
  await testValidateInvoiceItems();
  testStatusTransitionHelpers();
  await testInvoicePaymentTokenExpiry();
  await testInvoicePaymentTokenInvalid();
  await testProductPrepareInvoiceItems();
  testProductMetaBehavior();
  await testInvoiceCalculatorTotals();
  testDetermineInvoiceEmailDecision();
  await testUpdateInvoiceDraftInPlace();
  await testUpdateInvoiceDraftToAutoTransition();
  await testProcessInvoicePaymentFailureDoesNotMutateInvoice();

  console.log('✅ All invoice validation tests passed');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Test failed:', err.message || err);
  process.exit(1);
});
