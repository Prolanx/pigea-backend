import 'dotenv/config';
import mongoose from 'mongoose';

async function checkAndDropIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('invoices');

    // List current indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes on invoices collection:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    // Check if invoiceNumber_1 exists
    const hasInvoiceNumberIndex = indexes.some(idx => idx.name === 'invoiceNumber_1');
    
    if (hasInvoiceNumberIndex) {
      console.log('\n⚠️  Found invoiceNumber_1 index - dropping it...');
      await collection.dropIndex('invoiceNumber_1');
      console.log('✅ Successfully dropped invoiceNumber_1 index');
      
      // Verify it's gone
      const afterIndexes = await collection.indexes();
      console.log('\n📋 Indexes after drop:');
      afterIndexes.forEach(index => {
        console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
      });
    } else {
      console.log('\n✅ invoiceNumber_1 index does not exist');
    }

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndDropIndex();
