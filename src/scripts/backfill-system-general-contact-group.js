#!/usr/bin/env node
/*
One-time migration:
Mark existing merchant-owned "General" ContactType records as system-controlled.

Why:
  New logic treats "General" as an immutable system group used for inbox auto-contact creation.
  Older merchants may already have a "General" group created before `isSystemGroup` existed.

Usage:
  # dry-run (default)
  node src/scripts/backfill-system-general-contact-group.js
  node src/scripts/backfill-system-general-contact-group.js --dry-run

  # apply changes
  node src/scripts/backfill-system-general-contact-group.js --apply

Notes:
  - Safe to run multiple times.
  - Requires MONGODB_URI to be configured (or local fallback URI).
*/

import mongoose from 'mongoose';
import ContactType from '../database/models/ContactType.js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const DRY_RUN = !APPLY;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow';

async function run() {
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (no writes)' : 'APPLY'}`);
  console.log(`Connecting to MongoDB (${DB_URI})...`);

  await mongoose.connect(DB_URI);

  let scanned = 0;
  let candidates = 0;
  let updated = 0;

  const cursor = ContactType.find({ name: 'General' }).cursor();

  for await (const contactType of cursor) {
    scanned += 1;

    if (contactType.isSystemGroup === true) {
      continue;
    }

    candidates += 1;
    console.log(
      `General group candidate: ${contactType._id} (merchant: ${contactType.merchantId}) isSystemGroup: ${String(contactType.isSystemGroup)}`
    );

    if (APPLY) {
      await ContactType.updateOne(
        { _id: contactType._id },
        { $set: { isSystemGroup: true } },
      );
      updated += 1;
    }
  }

  console.log('\nMigration summary:');
  console.log(`- General groups scanned: ${scanned}`);
  console.log(`- Groups requiring update: ${candidates}`);
  console.log(`- Groups updated: ${APPLY ? updated : 0}`);
  if (DRY_RUN) {
    console.log('- Dry-run complete. Re-run with --apply to persist changes.');
  }

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
