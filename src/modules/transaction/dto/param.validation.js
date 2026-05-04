import { query } from '@common/validators.js';

export const transactionIdQueryDtoSchema = [
  query('transactionId')
    .trim()
    .notEmpty()
    .withMessage('transactionId is required')
    .isString()
    .withMessage('transactionId must be a string'),
];
