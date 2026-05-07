import { body } from '@common/utilities/validators.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

const connectChannelDtoSchema = [
  body('accountLabel')
    .optional()
    .isString()
    .withMessage(InboxConstants.VALIDATION.CHANNEL_ACCOUNT_LABEL_MUST_BE_STRING),
  body('accountValue')
    .optional()
    .isString()
    .withMessage(InboxConstants.VALIDATION.CHANNEL_ACCOUNT_VALUE_MUST_BE_STRING),
  body('configuration')
    .optional()
    .isObject()
    .withMessage(InboxConstants.VALIDATION.CHANNEL_CONFIGURATION_MUST_BE_OBJECT),
];

export default connectChannelDtoSchema;
