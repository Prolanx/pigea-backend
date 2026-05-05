import inboundEmailWebhookDtoSchema from '@modules/inbox/dto/inbound-email-webhook.validation.js';
import listMessagesDtoSchema from '@modules/inbox/dto/list-messages.validation.js';
import updateMessageStatusDtoSchema from '@modules/inbox/dto/update-message-status.validation.js';
import setInboxSlugDtoSchema from '@modules/inbox/dto/set-inbox-slug.validation.js';

export const dto = {
  inboundEmailWebhookDtoSchema,
  listMessagesDtoSchema,
  updateMessageStatusDtoSchema,
  setInboxSlugDtoSchema,
};

export {
  inboundEmailWebhookDtoSchema,
  listMessagesDtoSchema,
  updateMessageStatusDtoSchema,
  setInboxSlugDtoSchema,
};
