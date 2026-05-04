import { body } from '@common/validators.js';

/**
 * Validation schema for sending a message/reply
 */
const sendMessageDtoSchema = [
  body('contactId')
    .notEmpty()
    .withMessage('Contact ID is required')
    .isMongoId()
    .withMessage('Contact ID must be a valid MongoDB ObjectId'),

  body('body')
    .notEmpty()
    .withMessage('Message body is required')
    .isString()
    .withMessage('Message body must be a string')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message body must be between 1 and 5000 characters'),
];

export default sendMessageDtoSchema;
