#!/usr/bin/env node
/*
Backfill script: Populate `contactCount` on Stat documents based on actual contacts.

This should be run once after the Stat.contactCount field is added to the schema,
so that existing merchants have an accurate overall contact count.

Usage:
  # dry-run (reports changes, does not write)
  node scripts/backfill-stats-contact-count.js --dry-run

  # apply changes
  node scripts/backfill-stats-contact-count.js --apply

Notes:
- Safe to run multiple times. Only updates when the stored value differs from the real count.
- Requires a running MongoDB and correct MONGODB_URI env var.
*/

import mongoose from 'mongoose';
import Stat from '../database/models/Stat.js';
import Contact from '../database/models/Contact.js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');

async function run() {
  console.log(`Connecting to MongoDB (${process.env.MONGODB_URI || 'env:MONGODB_URI'})...`);
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow');

  const stats = await Stat.find({});
  let total = 0;
  let updated = 0;

  for (const stat of stats) {
    total++;
    const merchantId = stat.merchantId;
    const realCount = await Contact.countDocuments({ merchantId });
    const stored = stat.contactCount ?? 0;

    if (stored !== realCount) {
      console.log(`Merchant ${merchantId}: contactCount ${stored} -> ${realCount}`);
      if (APPLY) {
        await Stat.updateOne({ _id: stat._id }, { $set: { contactCount: realCount } });
        updated++;
      }
    }
  }

  // Ensure every merchant with contacts but no stat record gets one created
  const merchantsWithContacts = await Contact.distinct('merchantId');
  for (const merchantId of merchantsWithContacts) {
    const exists = await Stat.exists({ merchantId });
    if (!exists) {
      const realCount = await Contact.countDocuments({ merchantId });
      console.log(`Merchant ${merchantId}: no Stat record found, creating with contactCount=${realCount}`);
      if (APPLY) {
        await Stat.create({ merchantId, contactCount: realCount });
        updated++;
      }
      total++;
    }
  }

  console.log(`Processed ${total} stat records. ${APPLY ? `${updated} updated.` : `Would update ${updated}.`}`);
  if (!APPLY) {
    console.log('Dry-run completed. No writes performed. Run with --apply to make changes.');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
