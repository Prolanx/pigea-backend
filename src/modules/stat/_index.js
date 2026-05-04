import StatDAO from './dao/stat-dao/_index.js';
import StatController from './controller/stat/_index.js';
import createStatRoutes from './routes/stat.routes.js';

const statDAO = new StatDAO();
const statController = new StatController(statDAO);

export default {
  dao: { StatDAO },
  controller: { StatController },
  routes: { createStatRoutes, statController },
};