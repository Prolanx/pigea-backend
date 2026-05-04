import mongoose from 'mongoose';

/**
 * InboxMessage Model
 * Channel-agnostic inbox message entity.
 * Supports email, website_chat, and whatsapp channels.
 * All provider-specific fields are normalized at ingestion time.
 */
const inboxMessageSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },

    // Channel that delivered this message
    channelType: {
      type: String,
      enum: ['email', 'website_chat', 'whatsapp'],
      required: true,
      index: true,
    },

    // Message direction from the merchant's perspective
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
      default: 'inbound',
    },

    // Provider-assigned message ID used for idempotency
    externalMessageId: {
      type: String,
      default: null,
    },

    // Groups messages in the same thread/conversation
    threadKey: {
      type: String,
      default: null,
      index: true,
    },

    // Who sent this message
    sender: {
      address: { type: String, default: null }, // email address or phone or chat ID
      displayName: { type: String, default: null },
    },

    // Who received this message (supports CC/BCC for email)
    recipients: [
      {
        address: { type: String },
        displayName: { type: String, default: null },
        _id: false,
      },
    ],

    // Subject line (email only)
    subject: {
      type: String,
      default: null,
    },

    // Plain text body
    bodyText: {
      type: String,
      default: null,
    },

    // Rich HTML body (email only)
    bodyHtml: {
      type: String,
      default: null,
    },

    // File attachments
    attachments: [
      {
        filename: { type: String },
        url: { type: String, default: null },
        contentType: { type: String, default: null },
        size: { type: Number, default: 0 },
        _id: false,
      },
    ],

    // Raw provider payload for debugging / future enrichment
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // How the message arrived
    sourceType: {
      type: String,
      enum: ['webhook', 'api', 'manual'],
      required: true,
      default: 'webhook',
    },

    // Merchant read/archive state
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      required: true,
      default: 'unread',
      index: true,
    },

    // When the provider says the message was sent
    receivedAt: {
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

// Composite indexes for efficient merchant inbox queries
inboxMessageSchema.index({ merchantId: 1, receivedAt: -1 });
inboxMessageSchema.index({ merchantId: 1, status: 1, receivedAt: -1 });
inboxMessageSchema.index({ merchantId: 1, channelType: 1, receivedAt: -1 });
inboxMessageSchema.index({ threadKey: 1, receivedAt: 1 });

// Idempotency: one externalMessageId per merchant
inboxMessageSchema.index(
  { merchantId: 1, externalMessageId: 1 },
  { unique: true, sparse: true }
);

const InboxMessage = mongoose.model('InboxMessage', inboxMessageSchema);

export default InboxMessage;
