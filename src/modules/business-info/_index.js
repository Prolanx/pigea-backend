import createBusinessInfoRoutes from './routes/business-info.routes.js';
import BusinessInfoController from './controller/businessInfo.controller.js';

export const routes = { createBusinessInfoRoutes };
export const controller = { BusinessInfoController };

export default { routes, controller };