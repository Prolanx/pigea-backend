#!/usr/bin/env node
/*
Migration script: Rename configuration.slug → configuration.value
on email InboxChannelConnection documents, and remove legacy
configuration.emailPrefix / configuration.emailDomain fields.

Usage:
  node src/scripts/migrate-channel-config-slug-to-value.js --dry-run
  node src/scripts/migrate-channel-config-slug-to-value.js --apply
*/

import 'dotenv/config';
import mongoose from 'mongoose';
import InboxChannelConnection from '../database/models/InboxChannelConnection.js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow');
  console.log('Connected.\n');

  const channels = await InboxChannelConnection.find({
    channelType: 'email',
    'configuration.slug': { $exists: true },
  }).lean();

  console.log(`Found ${channels.length} email channel(s) with configuration.slug.\n`);

  let migrated = 0;

  for (const ch of channels) {
    const slug = ch.configuration?.slug;
    console.log(`[${APPLY ? 'APPLY' : 'WOULD APPLY'}] Channel ${ch._id}: configuration.slug "${slug}" → configuration.value`);

    if (APPLY) {
      await InboxChannelConnection.updateOne(
        { _id: ch._id },
        {
          $set: {
            'configuration.label': 'slug',
            'configuration.value': slug,
          },
          $unset: {
            'configuration.slug': '',
            'configuration.emailPrefix': '',
            'configuration.emailDomain': '',
          },
        },
      );
      migrated++;
    }
  }

  console.log('\n─── Summary ───────────────────────────────────────');
  console.log(`  Found:    ${channels.length}`);
  console.log(`  Migrated: ${APPLY ? migrated : `${migrated} (dry-run)`}`);
  console.log('───────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
