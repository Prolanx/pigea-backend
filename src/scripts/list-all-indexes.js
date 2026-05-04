import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow';

async function listIndexes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('invoices');

    const indexes = await collection.indexes();
    console.log('📋 ALL INDEXES on invoices collection:\n');
    indexes.forEach(index => {
      console.log(`Index: ${index.name}`);
      console.log(`  Keys: ${JSON.stringify(index.key)}`);
      console.log(`  Unique: ${index.unique || false}`);
      console.log(`  Sparse: ${index.sparse || false}`);
      console.log('');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listIndexes();
