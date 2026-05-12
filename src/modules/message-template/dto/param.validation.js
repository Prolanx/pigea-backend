import { param } from '@common/utilities/validators.js';

export const messageTemplateIdParamDtoSchema = [
  param('id')
    .notEmpty()
    .withMessage('Message template ID is required')
    .isMongoId()
    .withMessage('Message template ID must be a valid ObjectId'),
];
