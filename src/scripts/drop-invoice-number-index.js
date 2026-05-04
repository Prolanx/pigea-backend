import 'dotenv/config';
import mongoose from 'mongoose';

async function dropInvoiceNumberIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Invoice collection
    const db = mongoose.connection.db;
    const collection = db.collection('invoices');

    // Drop the unique index on invoiceNumber
    try {
      await collection.dropIndex('invoiceNumber_1');
      console.log('✅ Successfully dropped invoiceNumber_1 index');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('ℹ️  Index invoiceNumber_1 does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // List remaining indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes on invoices collection:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, Object.keys(index.key).map(k => `${k}: ${index.key[k]}`).join(', '));
    });

    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropInvoiceNumberIndex();
