import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  itemCategory: {
    type: String,
    enum: ['service', 'ecommerce'],
    required: true,
    default: 'service',
  },
  // Optional reference to the product record (maintained for traceability)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() {
      return this.itemCategory === 'ecommerce';
    },
  },
  // Snapshot of product/item data at the time of invoicing
  name: {
    type: String,
    trim: true,
    required: true,
  },
  quantity: {
    type: Number,
    min: 0,
    required: true,
  },
  unitPrice: {
    type: Number,
    min: 0,
    required: true,
  },
  total: {
    type: Number,
    min: 0,
  },
  // Service-specific metadata
  durationHours: {
    type: Number,
    min: 0,
    required: function() {
      return this.itemCategory === 'service' && this.durationHours != null;
    },
  },
  repeatInterval: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none',
  }
}, { discriminatorKey: 'itemCategory', _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    trim: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
    index: true
  },
  customerName: {
    type: String,
    trim: true,
    default: ''
  },
  customerEmail: {
    type: String,
    trim: true,
    required: true
  },
  invoiceCategory: {
    type: String,
    enum: ['service', 'ecommerce'],
    required: true,
    default: 'service'
  },
  currency: {
    type: String,
    trim: true,
    required: true,
    default: 'USD'
  },
  // Order ID is generated server-side for ecommerce; not populated by frontend
  orderId: {
    type: String,
    trim: true
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },
  // Ecommerce metadata (checkout email, fulfillment, etc.)
  productMeta: {
    type: new mongoose.Schema(
      {
        fulfillmentStatus: {
          type: String,
          enum: ['pending', 'ready_to_ship', 'shipped', 'delivered']
        },
        orderId: {
          type: String,
          trim: true
        }
      },
      { _id: false }
    ),
    default: null,
    validate: {
      validator: function (value) {
        if (this.invoiceCategory === 'ecommerce') {
          return value != null && typeof value === 'object';
        }
        return value == null;
      },
      message: 'productMeta must be set for ecommerce invoices and null for service invoices'
    }
  },
  items: {
    type: [invoiceItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Invoice must have at least one item'
    }
  },
  subtotal: {
    type: Number,
    min: 0
  },
  tax: {
    type: Number,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  // Accepted status values are defined in constants.invoice.INVOICE_STATUSES
  // (database and code should remain in sync):
  // ['draft', 'unpaid', 'paid', 'cancelled', 'refunded']
  status: {
    type: String,
    enum: ['draft', 'unpaid', 'paid', 'cancelled', "refunded"],
    default: 'draft'
  },
  latestTransactionId: {
    type: String,
    trim: true,
    default: null,
  },
  issueDate: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  dueDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'manual'
  },
  notes: {
    type: String,
    trim: true
  },
  // Versioning fields
  rootInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true,
  },
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null
  },
  versionNumber: {
    type: Number,
    default: 1
  },
  isLatest: {
    type: Boolean,
    default: true,
    index: true
  },
  // Status history per version
  statusHistory: {
    type: [
      new mongoose.Schema(
        {
          status: { type: String, enum: ['draft','unpaid','paid','cancelled', 'refunded'] },
          changedAt: { type: Date, default: Date.now }
        },
        { _id: false }
      )
    ],
    default: []
  },
  // Audit trail of actions (not state transitions)
  auditTrail: {
    type: [
      new mongoose.Schema(
        {
          action: { type: String, enum: ['drafted','sent','re-sent','paid','cancelled','refunded'] },
          changedAt: { type: Date, default: Date.now }
        },
        { _id: false }
      )
    ],
    default: []
  },
}, {
  timestamps: true
});

// Ensure item-type discriminator handling for invoice line items, allowing service/ecommerce subdoc rules
invoiceSchema.path('items').discriminator('service', new mongoose.Schema({
  // service-specific fields
  durationHours: { type: Number, min: 0 },
  repeatInterval: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  }
}, { _id: false }));

invoiceSchema.path('items').discriminator('ecommerce', new mongoose.Schema({
  // ecommerce-specific fields
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, { _id: false }));

// Ensure compound index for quick latest lookup
invoiceSchema.index({ rootInvoiceId: 1, isLatest: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
