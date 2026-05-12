import { controller } from '@modules/message-template/controller/_index.js';
import { dao } from '@modules/message-template/dao/_index.js';
import * as dto from '@modules/message-template/dto/_index.js';
import createMessageTemplateRoutes from '@modules/message-template/routes/_index.js';

export const messageTemplate = {
  controller,
  dao,
  dto,
  routes: { createMessageTemplateRoutes },
};

export default messageTemplate;
