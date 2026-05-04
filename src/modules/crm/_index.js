/**
 * CRM Module Exports
 * Central export point for CRM module
 */
import { controller } from './controller/_index.js';
import { dao } from './dao/_index.js';
import * as dto from './dto/_index.js';
import createCrmRoutes from './routes/_index.js';
import * as constants from './constants/_index.js';
import * as utils from './utils/_index.js';

export const crm = {
  controller,
  dao,
  dto,
  routes: { createCrmRoutes },
  constants,
  utils
};

export default crm;
