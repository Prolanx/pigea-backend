import inboundEmailWebhookDtoSchema from '@modules/inbox/dto/inbound-email-webhook.validation.js';
import listMessagesDtoSchema from '@modules/inbox/dto/list-messages.validation.js';
import updateMessageStatusDtoSchema from '@modules/inbox/dto/update-message-status.validation.js';

export const dto = {
  inboundEmailWebhookDtoSchema,
  listMessagesDtoSchema,
  updateMessageStatusDtoSchema,
};

export {
  inboundEmailWebhookDtoSchema,
  listMessagesDtoSchema,
  updateMessageStatusDtoSchema,
};
