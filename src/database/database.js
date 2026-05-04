import mongoose from 'mongoose';

/**
 * Database configuration and connection
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   * @param {string} uri - MongoDB connection URI
   * @returns {Promise<void>}
   */
  async connect(uri) {
    try {
      await mongoose.connect(uri);
      this.connection = mongoose.connection;
      
      console.log('✓ MongoDB connected successfully');
      
      // Handle connection events
      this.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      this.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      this.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });

    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      // Do NOT exit the process here — allow caller to handle the failure gracefully
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error.message);
    }
  }

  /**
   * Get database connection status
   * @returns {boolean}
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export default new Database();
