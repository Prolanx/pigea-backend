import { body } from '@common/utilities/validators.js';

const createMessageTemplateDtoSchema = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Template name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Template name must be between 2 and 120 characters'),

  body('channel')
    .optional()
    .isIn(['all', 'email', 'whatsapp'])
    .withMessage('Channel must be one of: all, email, whatsapp'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Template content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Template content must be between 1 and 5000 characters'),
];

export default createMessageTemplateDtoSchema;
