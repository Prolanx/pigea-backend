import mongoose from 'mongoose';

const inboxChannelConnectionSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    channelType: {
      type: String,
      enum: ['email', 'website_chat', 'whatsapp'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      required: true,
      default: 'disconnected',
      index: true,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    disconnectedAt: {
      type: Date,
      default: null,
    },
    configuration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

inboxChannelConnectionSchema.index({ merchantId: 1, channelType: 1 }, { unique: true });
inboxChannelConnectionSchema.index({ merchantId: 1, status: 1 });
// Unique value per email channel — used to route inbound emails to the correct merchant
inboxChannelConnectionSchema.index(
  { 'configuration.value': 1 },
  { unique: true, sparse: true, partialFilterExpression: { channelType: 'email' } },
);

const InboxChannelConnection = mongoose.model('InboxChannelConnection', inboxChannelConnectionSchema);

export default InboxChannelConnection;
