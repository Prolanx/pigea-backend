/**
 * Common validators export
 * Re-exports from adapters to provide abstraction layer
 * Features should import from here, NOT directly from adapters
 */
export { validateExpressValidator, body, param, query } from '@adapters/validator/validator.js';
