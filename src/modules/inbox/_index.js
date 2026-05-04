/**
 * Inbox Module Exports
 * Central export point for the inbox module.
 */
import { controller } from '@modules/inbox/controller/_index.js';
import { dao } from '@modules/inbox/dao/_index.js';
import * as dto from '@modules/inbox/dto/_index.js';
import createInboxRoutes from '@modules/inbox/routes/_index.js';
import * as constants from '@modules/inbox/constants/_index.js';

export const inbox = {
  controller,
  dao,
  dto,
  routes: { createInboxRoutes },
  constants,
};

export default inbox;
