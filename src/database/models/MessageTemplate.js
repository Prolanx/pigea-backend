import mongoose from 'mongoose';

const messageTemplateSchema = new mongoose.Schema(
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
    channel: {
      type: String,
      enum: ['all', 'email', 'whatsapp'],
      required: true,
      default: 'all',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

messageTemplateSchema.index({ merchantId: 1, name: 1 }, { unique: true });
messageTemplateSchema.index({ merchantId: 1, channel: 1 });

const MessageTemplate = mongoose.model('MessageTemplate', messageTemplateSchema);

export default MessageTemplate;
