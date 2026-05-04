import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

// Compound index for merchant categories
categorySchema.index({ merchantId: 1, name: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
