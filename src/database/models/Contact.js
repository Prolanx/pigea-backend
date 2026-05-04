import mongoose from 'mongoose';

/**
 * Contact Model
 * Stores actual contact records with dynamic field data
 * Field structure is defined by the ContactType
 */
const contactSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    contactTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContactType',
      required: true,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    status: {
      type: String,
      required: true,
      default: 'sys_new',
      // No enum - can be system status ID (sys_*) or custom status ObjectId
    },
    source: {
      type: String,
      enum: ['WebsiteForm', 'Manual'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
contactSchema.index({ merchantId: 1, status: 1 });
contactSchema.index({ merchantId: 1, contactTypeId: 1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
