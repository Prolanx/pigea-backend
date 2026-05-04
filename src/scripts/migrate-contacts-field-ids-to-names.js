#!/usr/bin/env node
/*
Migration: remap Contact.data keys from field IDs -> field names and backfill sys_name.

Usage:
  # dry-run (reports changes, does not write)
  node scripts/migrate-contacts-field-ids-to-names.js --dry-run

  # apply changes
  node scripts/migrate-contacts-field-ids-to-names.js --apply

Notes:
- This is a destructive change to stored contact.data keys. Make a backup before applying.
- The script is idempotent: running it again will detect no-op for already-migrated documents.
*/

import mongoose from 'mongoose';
import Contact from '../database/models/Contact.js';
import ContactType from '#database/models/ContactType.js';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const DRY = !APPLY;

async function mapDataKeys(data, contactType) {
  const out = {};
  const fieldMap = new Map((contactType?.fields || []).map(f => [String(f.id || f._id), f.name || f.id]));

  // preserve legacy values into temps but DO NOT copy legacy keys into the output
  let legacyFirst = null;
  let legacyLast = null;
  for (const [k, v] of Object.entries(data || {})) {
    if (k === 'sys_firstName') {
      legacyFirst = String(v || '').trim();
      continue; // do NOT copy legacy key
    }
    if (k === 'sys_lastName') {
      legacyLast = String(v || '').trim();
      continue; // do NOT copy legacy key
    }

    if (k.startsWith('sys_')) {
      // copy other system fields (sys_email, sys_name if already present)
      out[k] = v;
      continue;
    }

    const mapped = fieldMap.get(String(k));
    if (mapped) out[mapped] = v;
    else out[k] = v; // unknown key - keep as-is
  }

  // ensure sys_name (prefer existing, else derive from legacy temps)
  if (!out.sys_name) {
    if (legacyFirst || legacyLast) {
      out.sys_name = `${(legacyFirst || '').trim()} ${(legacyLast || '').trim()}`.trim();
    }
  }

  // remove legacy email/name
  if ('email' in out) delete out.email;
  if ('name' in out) delete out.name;

  return out;
}

async function run() {
  console.log(`Connecting to MongoDB (${process.env.MONGODB_URI || 'env:MONGODB_URI'})...`);
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow');

  const cursor = Contact.find().cursor();
  let total = 0;
  let updated = 0;
  for await (const contact of cursor) {
    total++;
    const contactType = await ContactType.findById(contact.contactTypeId).lean();
    const newData = await mapDataKeys(contact.data || {}, contactType || { fields: [] });

    // Simple deep-compare (shallow compare of keys/values)
    const same = JSON.stringify(newData) === JSON.stringify(contact.data || {});
    if (!same) {
      console.log(`Contact ${contact._id}: will update keys -> [${Object.keys(newData).join(', ')}]`);
      if (APPLY) {
        await Contact.updateOne({ _id: contact._id }, { $set: { data: newData } });
        updated++;
      }
    }
  }

  // Migrate ContactType documents: replace sys_firstName/sys_lastName with sys_name
  const contactTypeCursor = ContactType.find().cursor();
  let ctTotal = 0;
  let ctUpdated = 0;
  for await (const ct of contactTypeCursor) {
    ctTotal++;
    const fields = Array.isArray(ct.fields) ? ct.fields.slice() : [];
    const hasFirst = fields.some(f => String(f.id) === 'sys_firstName');
    const hasLast = fields.some(f => String(f.id) === 'sys_lastName');
    const hasName = fields.some(f => String(f.id) === 'sys_name');

    if ((hasFirst || hasLast) && !hasName) {
      // Determine required flag: if either first/last was required, make sys_name required
      const firstDef = fields.find(f => String(f.id) === 'sys_firstName');
      const lastDef = fields.find(f => String(f.id) === 'sys_lastName');
      const required = Boolean((firstDef && firstDef.required) || (lastDef && lastDef.required));

      // Remove legacy entries
      const newFields = fields.filter(f => !['sys_firstName', 'sys_lastName'].includes(String(f.id)));
      // Insert sys_name at the beginning (preserve original position loosely)
      newFields.unshift({ id: 'sys_name', name: 'Name', required });

      console.log(`ContactType ${ct._id}: will replace first/last -> sys_name (required=${required})`);
      if (APPLY) {
        await ContactType.updateOne({ _id: ct._id }, { $set: { fields: newFields } });
        ctUpdated++;
      }
    } else if ((hasFirst || hasLast) && hasName) {
      // Remove legacy first/last if sys_name already present
      const newFields = fields.filter(f => !['sys_firstName', 'sys_lastName'].includes(String(f.id)));
      console.log(`ContactType ${ct._id}: removing legacy first/last (sys_name exists)`);
      if (APPLY) {
        await ContactType.updateOne({ _id: ct._id }, { $set: { fields: newFields } });
        ctUpdated++;
      }
    }
  }

  console.log(`Processed ${total} contacts. ${APPLY ? `${updated} updated.` : `${total - updated} would be updated (dry-run).`}`);
  console.log(`Processed ${ctTotal} contact-types. ${APPLY ? `${ctUpdated} updated.` : `${ctUpdated} would be updated (dry-run).`}`);

  // --- Verification: ensure no legacy keys remain in DB ---
  const legacyQuery = { $or: [{ 'data.sys_firstName': { $exists: true } }, { 'data.sys_lastName': { $exists: true } }] };
  const contactsWithLegacy = await Contact.countDocuments(legacyQuery);
  const ctWithLegacy = await ContactType.countDocuments({ 'fields.id': { $in: ['sys_firstName', 'sys_lastName'] } });

  console.log(`Post-migration verification: contacts with legacy keys: ${contactsWithLegacy}, contact-types with legacy fields: ${ctWithLegacy}`);

  if (APPLY) {
    // Defensive cleanup: unset any remaining legacy keys and remove legacy field-ids from ContactType
    if (contactsWithLegacy > 0) {
      const res = await Contact.updateMany(legacyQuery, { $unset: { 'data.sys_firstName': '', 'data.sys_lastName': '' } });
      console.log(`Defensive cleanup: Contact.updateMany matched=${res.matchedCount || res.n || 0} modified=${res.modifiedCount || res.nModified || 0}`);
    }

    if (ctWithLegacy > 0) {
      const res = await ContactType.updateMany({ 'fields.id': { $in: ['sys_firstName', 'sys_lastName'] } }, { $pull: { fields: { id: { $in: ['sys_firstName', 'sys_lastName'] } } } });
      console.log(`Defensive cleanup: ContactType.updateMany matched=${res.matchedCount || res.n || 0} modified=${res.modifiedCount || res.nModified || 0}`);
    }

    // Re-run verification
    const contactsLeft = await Contact.countDocuments(legacyQuery);
    const ctLeft = await ContactType.countDocuments({ 'fields.id': { $in: ['sys_firstName', 'sys_lastName'] } });

    if (contactsLeft === 0 && ctLeft === 0) {
      console.log('SUCCESS: No legacy name keys remain in Contacts or ContactTypes.');
    } else {
      console.error('ERROR: Legacy keys remain after migration. Sample documents:');
      if (contactsLeft > 0) {
        const sample = await Contact.find(legacyQuery).limit(5).lean();
        console.error('Contacts (sample):', sample.map(s => ({ id: s._id, dataKeys: Object.keys(s.data || {}).filter(k => /sys_firstName|sys_lastName/.test(k)) })));
      }
      if (ctLeft > 0) {
        const sampleCt = await ContactType.find({ 'fields.id': { $in: ['sys_firstName', 'sys_lastName'] } }).limit(5).lean();
        console.error('ContactTypes (sample):', sampleCt.map(c => ({ id: c._id, fields: c.fields.map(f => f.id) })));
      }
      await mongoose.disconnect();
      process.exit(2);
    }
  } else {
    console.log('Dry-run completed. No writes performed. Run with --apply to make changes.');
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
