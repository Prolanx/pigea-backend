import { controller } from './controller/_index.js';
import { dao } from './dao/_index.js';
import * as dto from './dto/_index.js';
import createInvoiceRoutes from './routes/_index.js';
import * as utils from './utils/_index.js';

export const invoice = {
  controller,
  dao,
  dto,
  routes: { createInvoiceRoutes },
  utils
};

export default invoice;
