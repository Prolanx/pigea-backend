import request from 'supertest';
import app from '../src/app.js';
import Invoice from '../database/models/Invoice.js';
import Transaction from '../database/models/Transaction.js';
import mongoose from 'mongoose';

const testInvoice = {
  invoiceNumber: 'INV-2024-001',
  customerId: new mongoose.Types.ObjectId(),
  customerName: 'John Doe',
  customerEmail: 'johndoe@example.com',
  merchantId: new mongoose.Types.ObjectId(),
  items: [{ itemCategory: 'service', name: 'Test', quantity: 1, unitPrice: 100 }],
  subtotal: 100,
  tax: 0,
  total: 100,
  dueDate: new Date(Date.now() + 1000000),
  status: 'sent',
};

let createdInvoice;

describe('Invoice payment webhook integration', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/testdb');
    createdInvoice = await Invoice.create(testInvoice);
  });

  afterAll(async () => {
    await Invoice.deleteMany({});
    await Transaction.deleteMany({});
    await mongoose.disconnect();
  });

  it('returns 400 for missing invoiceNumber', async () => {
    const res = await request(app)
      .post('/api/invoice-payment/pay')
      .send({ transactionId: 'TX-001', status: 'success' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 for unknown invoice', async () => {
    const res = await request(app)
      .post('/api/invoice-payment/pay')
      .send({ invoiceNumber: 'INV-999', transactionId: 'TX-002', status: 'success' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('processes a successful webhook and links transaction', async () => {
    const res = await request(app)
      .post('/api/invoice-payment/pay')
      .send({ invoiceNumber: createdInvoice.invoiceNumber, transactionId: 'TX-003', status: 'success' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transaction.transactionId).toBe('TX-003');
    expect(res.body.data.invoice.latestTransactionId).toBe('TX-003');
    const tx = await Transaction.findOne({ transactionId: 'TX-003' });
    expect(tx).not.toBeNull();
  });
});
