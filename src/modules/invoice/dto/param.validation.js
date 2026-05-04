import { param, query, body } from '@common/validators.js';

/**
 * Validation schema for invoice id parameter
 * Simpler rule: id must be provided and be a non-empty string (no MongoDB-specific checks)
 */
export const idParamDtoSchema = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Invoice id is required')
    .isString()
    .withMessage('Invoice id must be a string')
];

/**
 * Validation schema for invoice number query parameter
 */
export const invoiceNumberQueryDtoSchema = [
  query('invoiceNumber')
    .trim()
    .notEmpty()
    .withMessage('Invoice number is required')
    .isString()
    .withMessage('Invoice number must be a string')
];

export const invoicePaymentDtoSchema = [
  body('invoiceNumber')
    .trim()
    .notEmpty()
    .withMessage('Invoice number is required')
    .isString()
    .withMessage('Invoice number must be a string'),
  body('transactionId')
    .trim()
    .notEmpty()
    .withMessage('transactionId is required')
    .isString()
    .withMessage('transactionId must be a string'),
];
