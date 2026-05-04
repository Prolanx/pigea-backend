import mongoose from 'mongoose';
import Invoice from '../database/models/Invoice.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow';

async function syncInvoiceIndexes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 Syncing indexes (this will drop old ones and create new ones based on current schema)...\n');
    
    // This drops indexes not in schema and creates missing ones
    await Invoice.syncIndexes();
    
    console.log('✅ Indexes synced successfully\n');

    // Show current indexes
    const collection = mongoose.connection.db.collection('invoices');
    const indexes = await collection.indexes();
    console.log('📋 Current indexes after sync:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done - Restart your server now');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

syncInvoiceIndexes();
