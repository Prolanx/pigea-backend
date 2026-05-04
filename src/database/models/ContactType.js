import mongoose from 'mongoose';

/**
 * ContactType Model
 * Templates that define which fields a contact should have
 * Acts as a schema definition for dynamic contact data
 */
const contactTypeSchema = new mongoose.Schema(
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
    },
    fields: [
      {
        id: {
          type: String,
          required: true,
          trim: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
        _id: false,
      },
    ],
    // The number of contacts currently assigned to this contact type
    // Maintained via application logic when contacts are created/deleted.
    contactCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - name must be unique per merchant
contactTypeSchema.index({ merchantId: 1, name: 1 }, { unique: true });

const ContactType = mongoose.model('ContactType', contactTypeSchema);

export default ContactType;
