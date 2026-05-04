#!/usr/bin/env node
/*
Backfill script: Inject the sys_name system field into ContactType documents that are missing it.

Background:
  The original `ensureEmailField` helper only auto-injected `sys_email`. Any contact type
  created before the rename to `ensureSystemFields` therefore has no `sys_name` entry in
  its `fields` array. Without that declaration, `validateContactData` never requires the
  field, contacts are stored without it, and `mapContactDataWithMeta` never emits it.

What this script does:
  - Finds every ContactType where `fields` has no entry with `id === 'sys_name'`.
  - Prepends `{ id: 'sys_name', required: true }` to that type's `fields` array.
  - Also ensures the existing `sys_email` entry has `required: true` (corrects any type
    that was created before the enforcement was in place).

Usage:
  # dry-run (reports changes, does not write)
  node scripts/backfill-contact-type-sys-name.js --dry-run

  # apply changes
  node scripts/backfill-contact-type-sys-name.js --apply

Notes:
  - Safe to run multiple times — already-patched documents are skipped.
  - Requires a running MongoDB and correct MONGODB_URI env var.
  - Existing contacts will still have no sys_name VALUE stored in contact.data; their
    sys_name entry will simply appear with a null value in API responses going forward.
    Run migrate-contacts-field-ids-to-names.js to backfill contact.data values if needed.
*/

import mongoose from 'mongoose';
import ContactType from '../database/models/ContactType.js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const DRY = !APPLY;

async function run() {
  console.log(`Mode: ${DRY ? 'DRY-RUN (no writes)' : 'APPLY'}`);
  console.log(`Connecting to MongoDB (${process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow'})...`);
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow');

  // Only process contact types that are missing sys_name entirely
  const cursor = ContactType.find({ 'fields.id': { $ne: 'sys_name' } }).cursor();

  let total = 0;
  let updated = 0;

  for await (const ct of cursor) {
    total++;

    // Build the corrected fields array: sys_name first, then sys_email (enforcing required),
    // then the rest of the merchant's custom fields unchanged.
    const customFields = ct.fields.filter((f) => f.id !== 'sys_email');
    const emailField = ct.fields.find((f) => f.id === 'sys_email');

    const patchedFields = [
      { id: 'sys_name', required: true },
      // Re-insert sys_email with required enforced; add it if it was missing too
      { id: 'sys_email', required: true, ...(emailField ? {} : {}) },
      ...customFields,
    ];

    console.log(
      `ContactType ${ct._id} (${ct.name}): prepending sys_name` +
        (!emailField ? ' + adding missing sys_email' : '') +
        ` — total fields: ${ct.fields.length} -> ${patchedFields.length}`
    );

    if (APPLY) {
      await ContactType.updateOne({ _id: ct._id }, { $set: { fields: patchedFields } });
      updated++;
    }
  }

  if (total === 0) {
    console.log('No contact types require patching — all already have sys_name.');
  } else {
    console.log(
      `\nProcessed ${total} contact type(s). ${
        APPLY ? `${updated} updated.` : `(dry-run) ${total} would be updated.`
      }`
    );
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
