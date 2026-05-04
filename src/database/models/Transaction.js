import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true,
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    trim: true,
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    required: true,
    default: 'pending',
  },
  metadata: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
