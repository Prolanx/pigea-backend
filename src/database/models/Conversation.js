import mongoose from 'mongoose';

/**
 * Conversation Model
 * Represents the lifecycle of a single customer interaction (ticket).
 * One conversation owns many InboxMessage documents via threadKey.
 * Status tracks whether the merchant has resolved the interaction.
 */
const conversationSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },

    // Channel that originated this conversation
    channelType: {
      type: String,
      enum: ['email', 'website_chat', 'whatsapp'],
      required: true,
    },

    // Links to all InboxMessage documents in this thread
    threadKey: {
      type: String,
      required: true,
      index: true,
    },

    // Human-readable ticket number, e.g. "TKT-9A2F-000042"
    ticketNumber: {
      type: String,
      required: true,
    },

    // Open = active, resolved = merchant closed this conversation
    status: {
      type: String,
      enum: ['open', 'resolved'],
      required: true,
      default: 'open',
      index: true,
    },

    // Merchant user assigned to this conversation (future feature)
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },

    // Denormalised: timestamp of the most recent message for sorting
    lastMessageAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    // Set when merchant resolves the conversation
    resolvedAt: {
      type: Date,
      default: null,
    },

    // Sender info from the first inbound message — used for left-panel display
    customerAddress: {
      type: String,
      default: null,
    },
    customerName: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// One active conversation per threadKey per merchant
// (sparse so multiple resolved conversations on same threadKey are allowed via app logic)
conversationSchema.index({ merchantId: 1, threadKey: 1, status: 1 });
conversationSchema.index({ merchantId: 1, status: 1, lastMessageAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
