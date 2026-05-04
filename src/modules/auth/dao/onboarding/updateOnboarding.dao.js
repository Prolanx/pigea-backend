import { db } from '@database/_index.js';
const { Account } = db.models;

export async function updateOnboardingDAO(userId, onboardingData) {
  // Only update onboarding field
  const updated = await Account.findByIdAndUpdate(
    userId,
    { onboarding: onboardingData },
    { new: true }
  );
  return updated;
}
