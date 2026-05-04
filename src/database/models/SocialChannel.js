// SocialChannel.js
import mongoose from 'mongoose';

const SocialChannelSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  platform: { type: String, required: true }, // e.g., 'instagram', 'facebook', 'twitter'
  accountId: { type: String, required: true }, // Platform account ID
  name: { type: String, required: true },
  profileImage: { type: String },
  accessToken: { type: String }, // Only store if needed for API calls
  status: { type: String, enum: ['connected', 'disconnected'], default: 'connected' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SocialChannelSchema.index({ merchantId: 1, platform: 1, accountId: 1 }, { unique: true });

export default mongoose.model('SocialChannel', SocialChannelSchema);
