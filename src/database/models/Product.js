import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    inventory: {
      type: Number,
      required: true,
      min: 0,
    },
    thresholdType: {
      type: String,
      enum: ['auto', 'custom'],
      default: 'auto',
      trim: true,
    },
    threshold: {
      type: Number,
      default: null,
      min: 0,
    },
    taxApplicable: {
      type: Boolean,
      default: false,
    },
    shippingType: {
      type: String,
      enum: ['auto', 'custom'],
      default: 'auto',
      trim: true,
    },
    shippingCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    attributes: {
      type: [
        {
          name: {
            type: String,
            trim: true,
          },
          values: {
            type: [
              {
                type: String,
                trim: true,
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
    variants: {
      type: [
        {
          sku: {
            type: String,
            required: true,
            trim: true,
          },
          price: {
            type: Number,
            min: 0,
          },
          stock: {
            type: Number,
            min: 0,
          },
          media: {
            type: [
              {
                type: String,
                trim: true,
              },
            ],
            default: [],
          },
          optionValues: {
            type: Object,
            default: {},
          },
        },
      ],
      default: [],
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
productSchema.index({ merchantId: 1, categoryId: 1 });
productSchema.index({ merchantId: 1, isActive: 1 });

// Unique constraints for SKU values
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });

// Unique constraint: Product name must be unique per merchant
productSchema.index({ merchantId: 1, name: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
