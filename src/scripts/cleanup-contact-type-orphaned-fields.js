#!/usr/bin/env node
/*
Cleanup script: Remove stale field references from ContactType documents.

Background:
  Each ContactType.fields entry contains a `{ id, required }` reference pointing to a
  FieldDefinition document. If that FieldDefinition was deleted from the DB, the reference
  becomes orphaned. With the fallback removed from resolveFieldReference, orphaned refs
  are now silently omitted from API responses — but they still bloat the ContactType
  document and will continue to appear in raw DB queries. This script removes them cleanly.

What this script does:
  - For every ContactType, collects all custom field IDs (non-sys_* entries) from its
    fields array.
  - Checks which of those IDs actually exist in the FieldDefinition collection.
  - Removes field entries whose IDs have no corresponding FieldDefinition document.
  - System field entries (sys_name, sys_email, etc.) are never touched.

Usage:
  # dry-run (reports changes, does not write)
  node scripts/cleanup-contact-type-orphaned-fields.js --dry-run

  # apply changes
  node scripts/cleanup-contact-type-orphaned-fields.js --apply

Notes:
  - Safe to run multiple times — already-clean documents produce no output.
  - Requires a running MongoDB and correct MONGODB_URI env var.
*/

import mongoose from 'mongoose';
import ContactType from '../database/models/ContactType.js';
import FieldDefinition from '../database/models/FieldDefinition.js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const DRY = !APPLY;

const SYS_PREFIX = 'sys_';

async function run() {
  console.log(`Mode: ${DRY ? 'DRY-RUN (no writes)' : 'APPLY'}`);
  console.log(`Connecting to MongoDB (${process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow'})...`);
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow');

  const cursor = ContactType.find().cursor();
  let totalTypes = 0;
  let updatedTypes = 0;
  let totalOrphans = 0;

  for await (const ct of cursor) {
    totalTypes++;

    const fields = Array.isArray(ct.fields) ? ct.fields : [];

    // Separate system fields (never touch) from custom field refs
    const systemFields = fields.filter((f) => String(f.id).startsWith(SYS_PREFIX));
    const customRefs = fields.filter((f) => !String(f.id).startsWith(SYS_PREFIX));

    if (customRefs.length === 0) continue;

    // Bulk-check which custom field IDs exist in FieldDefinition
    const customIds = customRefs.map((f) => f.id);
    const existingDefs = await FieldDefinition.find(
      { _id: { $in: customIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      '_id'
    ).lean();

    const existingIdSet = new Set(existingDefs.map((d) => d._id.toString()));

    const orphans = customRefs.filter((f) => !existingIdSet.has(String(f.id)));

    if (orphans.length === 0) continue;

    totalOrphans += orphans.length;
    console.log(
      `ContactType ${ct._id} ("${ct.name}"): ${orphans.length} orphaned field ref(s) — ` +
        orphans.map((f) => f.id).join(', ')
    );

    if (APPLY) {
      // Rebuild fields keeping only system fields + valid custom refs
      const validCustomRefs = customRefs.filter((f) => existingIdSet.has(String(f.id)));
      const patchedFields = [...systemFields, ...validCustomRefs];

      await ContactType.updateOne({ _id: ct._id }, { $set: { fields: patchedFields } });
      updatedTypes++;
    }
  }

  if (totalOrphans === 0) {
    console.log('No orphaned field references found — all ContactType.fields are clean.');
  } else {
    console.log(
      `\nFound ${totalOrphans} orphaned field ref(s) across ${updatedTypes || totalOrphans} contact type(s). ` +
        (APPLY ? `${updatedTypes} contact type(s) updated.` : '(dry-run) No writes performed.')
    );
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
