import inboundEmailWebhookDtoSchema from '@modules/inbox/dto/inbound-email-webhook.validation.js';
import listMessagesDtoSchema from '@modules/inbox/dto/list-messages.validation.js';
import updateMessageStatusDtoSchema from '@modules/inbox/dto/update-message-status.validation.js';
import replyToMessageDtoSchema from '@modules/inbox/dto/reply-to-message.validation.js';
import connectChannelDtoSchema from '@modules/inbox/dto/connect-channel.validation.js';
import updateChannelConfigDtoSchema from '@modules/inbox/dto/update-channel-config.validation.js';
import channelTypeParamDtoSchema from '@modules/inbox/dto/channel-type-param.validation.js';

export const dto = {
  inboundEmailWebhookDtoSchema,
  listMessagesDtoSchema,
  updateMessageStatusDtoSchema,
  replyToMessageDtoSchema,
  connectChannelDtoSchema,
  updateChannelConfigDtoSchema,
  channelTypeParamDtoSchema,
};

export {
  inboundEmailWebhookDtoSchema,
  listMessagesDtoSchema,
  updateMessageStatusDtoSchema,
  replyToMessageDtoSchema,
  connectChannelDtoSchema,
  updateChannelConfigDtoSchema,
  channelTypeParamDtoSchema,
};
