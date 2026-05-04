import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow';

async function dropAllInvoiceNumberIndexes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('invoices');

    // Drop both invoice number indexes
    const indexesToDrop = ['invoice_number_1', 'invoiceNumber_1'];
    
    for (const indexName of indexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        if (error.code === 27 || error.message.includes('index not found')) {
          console.log(`ℹ️  Index ${indexName} does not exist`);
        } else {
          console.error(`❌ Error dropping ${indexName}:`, error.message);
        }
      }
    }

    // Verify
    const indexes = await collection.indexes();
    console.log('\n📋 Remaining indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropAllInvoiceNumberIndexes();
