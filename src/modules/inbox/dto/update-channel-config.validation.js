import { body } from '@common/utilities/validators.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

const updateChannelConfigDtoSchema = [
  body('configuration')
    .notEmpty()
    .withMessage(InboxConstants.VALIDATION.CHANNEL_CONFIGURATION_REQUIRED)
    .bail()
    .isObject()
    .withMessage(InboxConstants.VALIDATION.CHANNEL_CONFIGURATION_MUST_BE_OBJECT),
];

export default updateChannelConfigDtoSchema;
