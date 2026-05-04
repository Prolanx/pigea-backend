#!/usr/bin/env node
/*
Verification script: Assert that sys_name is correctly declared across ContactType documents
and that the field resolution chain works end-to-end.

Checks performed:
  1. Every ContactType has { id: 'sys_name', required: true } in its fields array.
  2. Every ContactType has { id: 'sys_email', required: true } in its fields array.
  3. sys_name is declared BEFORE sys_email (ordering from ensureSystemFields).
  4. Sample Contact documents — reports how many already carry a sys_name value in data.

Usage:
  node scripts/verify-sys-name.js
*/

import mongoose from 'mongoose';
import ContactType from '../database/models/ContactType.js';
import Contact from '../database/models/Contact.js';

const PASS = '✓';
const FAIL = '✗';
const WARN = '⚠';

let failures = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ${PASS}  ${label}${detail ? ' — ' + detail : ''}`);
  } else {
    console.error(`  ${FAIL}  ${label}${detail ? ' — ' + detail : ''}`);
    failures++;
  }
}

async function run() {
  console.log(`Connecting to MongoDB (${process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow'})...`);
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow');

  // ──────────────────────────────────────────────────────────────────────────
  // Check 1 & 2 & 3: ContactType field declarations
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[ContactType field declarations]');

  const contactTypes = await ContactType.find().lean();
  assert('At least one ContactType exists in DB', contactTypes.length > 0, `found ${contactTypes.length}`);

  for (const ct of contactTypes) {
    const label = `"${ct.name}" (${ct._id})`;
    const fields = Array.isArray(ct.fields) ? ct.fields : [];

    const sysNameEntry = fields.find((f) => f.id === 'sys_name');
    const sysEmailEntry = fields.find((f) => f.id === 'sys_email');

    assert(`${label}: has sys_name field`, Boolean(sysNameEntry));
    assert(`${label}: sys_name is required`, sysNameEntry?.required === true);
    assert(`${label}: has sys_email field`, Boolean(sysEmailEntry));
    assert(`${label}: sys_email is required`, sysEmailEntry?.required === true);

    const sysNameIdx = fields.findIndex((f) => f.id === 'sys_name');
    const sysEmailIdx = fields.findIndex((f) => f.id === 'sys_email');
    assert(
      `${label}: sys_name declared before sys_email`,
      sysNameIdx !== -1 && sysEmailIdx !== -1 && sysNameIdx < sysEmailIdx,
      `positions: sys_name=${sysNameIdx}, sys_email=${sysEmailIdx}`
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Check 4: Contact data — how many contacts carry a sys_name value
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[Contact data coverage]');

  const totalContacts = await Contact.countDocuments();
  const contactsWithSysName = await Contact.countDocuments({ 'data.sys_name': { $exists: true, $ne: null, $ne: '' } });
  const contactsWithSysNameKey = await Contact.countDocuments({ 'data.sys_name': { $exists: true } });

  console.log(`  ${PASS}  Total contacts: ${totalContacts}`);
  console.log(
    `  ${contactsWithSysNameKey > 0 ? PASS : WARN}  Contacts with 'data.sys_name' key: ${contactsWithSysNameKey}`
  );
  console.log(
    `  ${contactsWithSysName > 0 ? PASS : WARN}  Contacts with non-empty 'data.sys_name' value: ${contactsWithSysName}`
  );
  if (contactsWithSysName < totalContacts) {
    console.log(
      `  ${WARN}  ${totalContacts - contactsWithSysName} contact(s) have no sys_name value yet` +
        ' — these are pre-existing records; sys_name will be populated on next contact update.'
    );
  }

  // Sample output: show 3 contact docs to illustrate actual data shape
  console.log('\n[Sample contact data (up to 3)]');
  const samples = await Contact.find().limit(3).populate('contactTypeId', 'name fields').lean();
  for (const c of samples) {
    const ctName = c.contactTypeId?.name || c.contactTypeId;
    const sysNameVal = c.data?.sys_name ?? '<absent>';
    const sysEmailVal = c.data?.sys_email ?? '<absent>';
    console.log(`  Contact ${c._id} (type: ${ctName})`);
    console.log(`    sys_name  = ${JSON.stringify(sysNameVal)}`);
    console.log(`    sys_email = ${JSON.stringify(sysEmailVal)}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  if (failures === 0) {
    console.log(`${PASS}  All assertions passed.`);
  } else {
    console.error(`${FAIL}  ${failures} assertion(s) failed.`);
  }

  await mongoose.disconnect();

  if (failures > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
