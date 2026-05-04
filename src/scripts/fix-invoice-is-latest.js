import 'dotenv/config';
import mongoose from 'mongoose';

async function fixInvoiceIsLatest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const invoices = db.collection('invoices');

    const invoiceId = '6978c4cf7ae7ab5f3b619680';

    // Find all versions of this invoice
    console.log('\n🔍 Checking for all versions of this invoice...');
    const allVersions = await invoices.find({
      $or: [
        { _id: new mongoose.Types.ObjectId(invoiceId) },
        { rootInvoiceId: new mongoose.Types.ObjectId(invoiceId) }
      ]
    }).toArray();

    console.log(`\nFound ${allVersions.length} version(s):`);
    allVersions.forEach(v => {
      console.log(`  - ID: ${v._id}, Version: ${v.versionNumber}, isLatest: ${v.isLatest}, Status: ${v.status}`);
    });

    if (allVersions.length === 1 && allVersions[0].isLatest === false) {
      console.log('\n⚠️  Only one version exists but isLatest is false - fixing...');
      await invoices.updateOne(
        { _id: new mongoose.Types.ObjectId(invoiceId) },
        { $set: { isLatest: true } }
      );
      console.log('✅ Fixed: Set isLatest to true');
    } else if (allVersions.length > 1) {
      console.log('\n⚠️  Multiple versions found - please manually verify which should be latest');
    }

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixInvoiceIsLatest();
