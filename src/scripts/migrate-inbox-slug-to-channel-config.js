#!/usr/bin/env node
/*
Migration script: Move inboxSlug from Account.businessInfo.inboxSlug
into the email InboxChannelConnection's configuration.slug field.

Usage:
  # dry-run (reports what would change, does not write)
  node src/scripts/migrate-inbox-slug-to-channel-config.js --dry-run

  # apply changes
  node src/scripts/migrate-inbox-slug-to-channel-config.js --apply

Notes:
- Safe to run multiple times (idempotent).
- Requires MONGODB_URI env var (or falls back to localhost).
- After running --apply, verify then manually drop the businessInfo.inboxSlug
  field from any remaining documents if needed.
*/

import 'dotenv/config';
import mongoose from 'mongoose';
import Account from '../database/models/Account.js';
import InboxChannelConnection from '../database/models/InboxChannelConnection.js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const DRY = !APPLY;

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow');
  console.log('Connected.\n');

  // Find all accounts that still have a non-null inboxSlug
  const accounts = await Account.find({
    'businessInfo.inboxSlug': { $nin: [null, ''] },
  }).lean();

  console.log(`Found ${accounts.length} account(s) with businessInfo.inboxSlug set.\n`);

  let migrated = 0;
  let alreadyMigrated = 0;
  let skipped = 0;

  for (const account of accounts) {
    const merchantId = account._id;
    const slug = account.businessInfo?.inboxSlug;

    if (!slug) {
      skipped++;
      continue;
    }

    // Check if email channel already has configuration.slug set
    const existing = await InboxChannelConnection.findOne({
      merchantId,
      channelType: 'email',
    }).lean();

    if (existing?.configuration?.slug) {
      console.log(
        `[SKIP] Account ${merchantId}: channel config already has slug "${existing.configuration.slug}"`,
      );
      alreadyMigrated++;
      continue;
    }

    console.log(
      `[${APPLY ? 'APPLY' : 'WOULD APPLY'}] Account ${merchantId}: migrate slug "${slug}" → InboxChannelConnection.configuration.slug`,
    );

    if (APPLY) {
      // Upsert the email channel connection — sets configuration.slug, preserves other config fields
      await InboxChannelConnection.findOneAndUpdate(
        { merchantId, channelType: 'email' },
        {
          $set: {
            'configuration.slug': slug,
          },
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );

      // Clear the old inboxSlug field from Account
      await Account.updateOne(
        { _id: merchantId },
        { $unset: { 'businessInfo.inboxSlug': '' } },
      );

      migrated++;
    }
  }

  console.log('\n─── Summary ───────────────────────────────────────');
  console.log(`  Accounts found with slug:  ${accounts.length}`);
  console.log(`  Migrated:                  ${APPLY ? migrated : `${migrated} (dry-run)`}`);
  console.log(`  Already migrated (skipped): ${alreadyMigrated}`);
  console.log(`  Skipped (no slug value):   ${skipped}`);
  console.log('───────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('Disconnected. Done.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
