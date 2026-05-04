import { controller } from './controller/_index.js';
import * as dto from './dto/_index.js';
import createMarketingRoutes from './routes/marketing.routes.js';
import * as utils from './utils/_index.js';
import * as constants from './constants/_index.js';

export const marketing = {
  controller,
  dto,
  routes: { createMarketingRoutes },
  utils,
  constants
};

export default marketing;
