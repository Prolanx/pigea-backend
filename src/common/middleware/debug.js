/**
 * Debug middleware for development and testing
 * Import and use these in server.js when needed for debugging
 */

/**
 * Simulates network latency by adding a delay to all requests
 * @param {number} delayMs - Delay in milliseconds (default: 4000ms)
 */
export function simulateNetworkDelay(delayMs = 4000) {
  return (req, res, next) => {
    setTimeout(() => {
      next();
    }, delayMs);
  };
}

/**
 * Simulates a server error for testing error handling
 * @param {string} message - Error message to throw
 */
export function simulateServerError(message = 'Simulated server error for testing') {
  return (req, res, next) => {
    throw new Error(message);
  };
}

/**
 * Logs all requests with timestamp and method/path
 */
export function requestLogger(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
}
