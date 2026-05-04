import * as dao from './dao/_index.js';
import * as dto from './dto/_index.js';
import controller from './controller/_index.js';
import createTransactionRoutes from './routes/_index.js';

export const transaction = {
  dao,
  dto,
  controller,
  routes: { createTransactionRoutes },
};

export default transaction;
