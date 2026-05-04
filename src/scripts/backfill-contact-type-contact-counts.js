#!/usr/bin/env node
/*
Backfill script: Populate `contactCount` on ContactType documents based on actual contacts.

Usage:
  # dry-run (reports changes, does not write)
  node scripts/backfill-contact-type-contact-counts.js --dry-run

  # apply changes
  node scripts/backfill-contact-type-contact-counts.js --apply

Notes:
- This is safe to run multiple times. It will only update contactCount if it differs.
- Requires a running MongoDB and correct MONGODB_URI env var.
*/

import mongoose from 'mongoose';
import ContactType from '../database/models/ContactType.js';
import Contact from '../database/models/Contact.js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const DRY = !APPLY;

async function run() {
  console.log(`Connecting to MongoDB (${process.env.MONGODB_URI || 'env:MONGODB_URI'})...`);
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow');

  const cursor = ContactType.find().cursor();
  let total = 0;
  let updated = 0;

  for await (const ct of cursor) {
    total++;

    const count = await Contact.countDocuments({ merchantId: ct.merchantId, contactTypeId: ct._id });

    if (ct.contactCount !== count) {
      console.log(`ContactType ${ct._id}: contactCount ${ct.contactCount} -> ${count}`);
      if (APPLY) {
        await ContactType.updateOne({ _id: ct._id }, { $set: { contactCount: count } });
        updated++;
      }
    }
  }

  console.log(`Processed ${total} contact types. ${APPLY ? `${updated} updated.` : `Would update ${updated}.`}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
