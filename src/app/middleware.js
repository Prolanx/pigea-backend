/**
 * Middleware Configuration
 * Sets up all Express middleware (CORS, body parsing, error handling)
 */
import cors from 'cors';
import express from 'express';
import { simulateNetworkDelay, simulateServerError, requestLogger } from '@common/middleware/debug.js';

/**
 * Creates CORS configuration based on environment variables
 * @returns {Object} CORS options object
 */
function createCorsOptions() {
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin)
      if (!origin) return callback(null, true);
      
      if (ALLOWED_ORIGINS.length === 0) {
        // If no origins configured, allow all (development mode)
        console.warn('⚠️  WARNING: No ALLOWED_ORIGINS configured. Allowing all origins.');
        return callback(null, true);
      }
      
      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  };
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
    data: null
  });
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
  console.error('Error STack:', err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    data: process.env.NODE_ENV === 'development' 
      ? { error: err.message, stack: err.stack } 
      : null
  });
}

/**
 * Applies all middleware to the Express app
 * @param {Express.Application} app - Express application instance
 */
export function applyMiddleware(app) {
  // CORS
  app.use(cors(createCorsOptions()));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Debug middleware (uncomment when needed)
  // import { simulateNetworkDelay, simulateServerError, requestLogger } from '@common/middleware/debug.js';
  // app.use(requestLogger);
   app.use(simulateNetworkDelay(5000));
  // app.use(simulateServerError('Test error'));
}

/**
 * Applies error handling middleware to the Express app
 * Must be called AFTER routes are registered
 * @param {Express.Application} app - Express application instance
 */
export function applyErrorHandlers(app) {
  app.use(notFoundHandler);
  app.use(errorHandler);
}
