import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ['incoming', 'outgoing'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email'],
      default: 'email',
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient message history queries
messageSchema.index({ contactId: 1, sentAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
