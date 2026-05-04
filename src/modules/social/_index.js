/**
 * Social module - namespace export (complies with guidelines)
 */
import { controller } from './controller/_index.js';
import { dao } from './dao/_index.js';
import * as dto from './dto/_index.js';
import { createChannelRoutes } from './routes/channel.routes.js';
import * as utils from './utils/_index.js';

export const social = {
  controller,
  dao,
  dto,
  routes: { createChannelRoutes },
  utils
};

export default social;
