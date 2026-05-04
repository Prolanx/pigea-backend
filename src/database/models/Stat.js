import mongoose from 'mongoose';

/**
 * Stat model keeps track of usage metrics for a single merchant account.
 * Each document is keyed by merchantId, and additional counters can be added
 * as features are instrumented.
 */
const statSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    customFieldCount: {
      type: Number,
      default: 0,
    },
    statusCount: {
      type: Number,
      default: 0,
    },
    // Overall number of contacts for this merchant across all contact groups.
    // Maintained via application logic — incremented on contact create, decremented on delete.
    contactCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Stat = mongoose.model('Stat', statSchema);
export default Stat;
