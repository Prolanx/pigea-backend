import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['merchant', 'customer'],
      default: 'merchant',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    verificationTokenSentAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    refreshTokenExpiry: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpiry: {
      type: Date,
    },
    passwordResetTokenSentAt: {
      type: Date,
    },

    // Merchant business information (sub-document)
    businessInfo: {
      // Identity
      name:             { type: String, trim: true, default: '' },
      logo:             { type: String, default: null },
      industry:         { type: String, trim: true, default: '' },

      // Contact
      email:            { type: String, trim: true, lowercase: true, default: '' },
      phone:            { type: String, trim: true, default: '' },

      // Address
      address:          { type: String, trim: true, default: '' },
      city:             { type: String, trim: true, default: '' },
      state:            { type: String, trim: true, default: '' },
      country:          { type: String, trim: true, default: '' },

      // Billing
      billingCurrency:  { type: String, trim: true, default: '' },
      paymentTerms:     { type: String, trim: true, default: '' },
      invoiceNote:      { type: String, trim: true, default: '' },
      useAccountEmailAsBusinessEmail: { type: Boolean, default: false },

      // Tax
      taxEnabled:       { type: Boolean, default: false },
      taxRate:          { type: Number, default: 0, min: 0 },
      taxId:            { type: String, trim: true, default: '' },

      // E-commerce defaults (businessType === 'ecommerce')
      lowStockThreshold:     { type: Number, default: 0, min: 0 },
      defaultShippingCost:   { type: Number, default: 0, min: 0 },

      // Service defaults (businessType === 'service')
      defaultClientStatus: { type: String, trim: true, default: '' },

    },

    // Onboarding (nested object, default null)
    onboarding: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
accountSchema.index({ verificationToken: 1 });
accountSchema.index({ passwordResetToken: 1 });
const Account = mongoose.model('Account', accountSchema);

export default Account;