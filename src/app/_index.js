import * as dependencies from './dependencies.js';
import * as middleware from './middleware.js';
import * as routes from './routes.js';
import * as startup from './startup.js';

export const app = {
  dependencies,
  middleware,
  routes,
  startup
};

export default app;
