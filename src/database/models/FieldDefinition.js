import mongoose from 'mongoose';

/**
 * FieldDefinition Model
 * Stores custom fields created by merchants
 * System fields are hardcoded in the application
 */
const fieldDefinitionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['text', 'select', 'date'],
      required: true,
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (options) {
          // Options required only for select type
          if (this.type === 'select') {
            return options && options.length > 0;
          }
          return true;
        },
        message: 'Select fields must have at least one option',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Unique field name per merchant
fieldDefinitionSchema.index({ merchantId: 1, name: 1 }, { unique: true });

const FieldDefinition = mongoose.model('FieldDefinition', fieldDefinitionSchema);

export default FieldDefinition;
