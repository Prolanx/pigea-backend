/**
 * Server Entry Point
 * Pure orchestration - no implementation details
 */

import 'dotenv/config';
import express from 'express';
import { createDependencies } from './app/dependencies.js';
import { applyMiddleware, applyErrorHandlers } from './app/middleware.js';
import { registerRoutes } from './app/routes.js';
import { connectDatabase, startServer, registerShutdownHandlers } from './app/startup.js';
import { initFirebase } from '@adapters/storage/init.js';




// Main application bootstrap
async function bootstrap() {
  // Create Express application
  const app = express();

  // Apply middleware
  applyMiddleware(app);

  // Connect to database before creating dependencies
  await connectDatabase();

  // Initialize Firebase storage adapter
  await initFirebase();

  // Create dependency container
  const dependencies = createDependencies();

  // Register all routes
  registerRoutes(app, dependencies);

  // Apply error handlers (must be after routes)
  applyErrorHandlers(app);

  // Register shutdown handlers
  registerShutdownHandlers();

  // Start the server
  const PORT = process.env.PORT || 3000;
  await startServer(app, PORT);

  return app;
}

// Start application
bootstrap().catch(error => {
  console.error('❌ Bootstrap failed:', error);
  console.error('Stack:', error.stack);
  // Don't call process.exit() - let it continue
});

export default bootstrap;
