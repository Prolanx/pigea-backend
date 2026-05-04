#!/usr/bin/env node
/* Lightweight verification script — asserts invoice API returns the new safe-array customer shape
   Usage:
     node scripts/assert-invoice-shape.js --url http://localhost:3000 --token <bearer>
*/
import axios from 'axios';

const argv = process.argv.slice(2);
const urlArg = argv.find(a => a.startsWith('--url='));
const tokenArg = argv.find(a => a.startsWith('--token='));
const base = (urlArg && urlArg.split('=')[1]) || 'http://localhost:3000';
const token = (tokenArg && tokenArg.split('=')[1]) || process.env.TEST_TOKEN;

if (!token) {
  console.error('Provide --token or set TEST_TOKEN');
  process.exit(2);
}

async function run() {
  const res = await axios.get(`${base}/api/invoices/list`, { headers: { Authorization: `Bearer ${token}` } });
  const data = res.data?.data;
  if (!Array.isArray(data)) {
    console.error('Unexpected response: data is not an array');
    process.exit(3);
  }

  for (const inv of data) {
    // customer (populated) must be object with data array
    if (inv.customer) {
      if (!Array.isArray(inv.customer.data)) {
        console.error('customer.data is not an array on invoice:', inv.id);
        process.exit(4);
      }
    }

    // customerSnapshot should not be present
    if ('customerSnapshot' in inv) {
      console.error('customerSnapshot should be removed from invoice shape:', inv.id);
      process.exit(5);
    }
  }

  console.log('OK: invoice shape assertions passed (customer.data array, no denormalized fields)');
}

run().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});