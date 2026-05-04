/**
 * Server Lifecycle Management
 * Handles server startup, database connections, and graceful shutdown
 */

import database from '@database/database.js';

/**
 * Connects to MongoDB database
 * @returns {Promise<boolean>} Returns true if connected, false if failed (but continues gracefully)
 */
export async function connectDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow';
  
  try {
    await database.connect(MONGODB_URI);
    console.log('✓ Database connected successfully');
    return true;
  } catch (dbError) {
    console.error('⚠️  WARNING: Failed to connect to MongoDB');
    console.error('   Database error:', dbError.message);
    console.error('   Server will continue but database operations will fail');
    console.error('');
    return false;
  }
}

/**
 * Starts the Express HTTP server
 * @param {Express.Application} app - Express application instance
 * @param {number} port - Port number to listen on
 * @returns {Promise<void>}
 */
export async function startServer(app, port = 3000) {
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [];

  try {
    // Start listening
    app.listen(port, () => {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API available at http://localhost:${port}`);
      console.log(`✓ Health check: http://localhost:${port}/health`);
      if (ALLOWED_ORIGINS.length > 0) {
        console.log(`✓ CORS enabled for: ${ALLOWED_ORIGINS.join(', ')}`);
      } else {
        console.log('⚠️  CORS: Allowing all origins (development mode)');
      }
      console.log('═══════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Fatal error starting server:', error);
    process.exit(1);
  }
}

/**
 * Gracefully shuts down the server
 * @returns {Promise<void>}
 */
export async function shutdownServer() {
  console.log('\n\nShutting down gracefully...');
  try {
    await database.disconnect();
    console.log('✓ Database disconnected');
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
}

/**
 * Registers graceful shutdown handlers
 */
export function registerShutdownHandlers() {
  process.on('SIGINT', shutdownServer);
  process.on('SIGTERM', shutdownServer);
}
