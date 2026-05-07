import { param } from '@common/utilities/validators.js';
import { InboxConstants } from '@modules/inbox/constants/inbox.constants.js';

const channelTypeParamDtoSchema = [
  param('channelType')
    .notEmpty()
    .withMessage(InboxConstants.VALIDATION.CHANNEL_TYPE_REQUIRED)
    .bail()
    .isIn(InboxConstants.CHANNEL_CARDS.ORDER)
    .withMessage(InboxConstants.VALIDATION.CHANNEL_TYPE_INVALID),
];

export default channelTypeParamDtoSchema;
