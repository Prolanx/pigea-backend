/**
 * Middleware shorthand barrel
 * Re-exports middleware for convenience
 */
export { validateDto, authenticate, authorize, authenticateForLogout } from '@common/middleware/_index.js';
export * as debug from '@common/middleware/debug.js';
