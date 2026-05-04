import mongoose from 'mongoose';

/**
 * Status Schema - for CUSTOM merchant-created statuses only
 * System statuses (New, Contacted, Converted, Lost) are hardcoded constants
 */
const statusSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      required: true,
      trim: true,
      default: '#6B7280', // Gray
      validate: {
        validator: function(v) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Color must be a valid hex color code (e.g., #FF5733)',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: merchant can't have duplicate status names
statusSchema.index({ merchantId: 1, name: 1 }, { unique: true });

const Status = mongoose.model('Status', statusSchema);

export default Status;
