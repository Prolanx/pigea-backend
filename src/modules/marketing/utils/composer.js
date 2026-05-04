import * as brevoAdapter from '@adapters/brevo/brevo.js';
import MarketingController from '@modules/marketing/controller/marketing/_index.js';
import createMarketingRoutes from '@modules/marketing/routes/marketing.routes.js';

/**
 * Module composer - wires marketing module dependencies and returns router + controller
 * Accepts optional overrides to support tests and alternative wiring
 */
export function createMarketingModule({ controller } = {}) {
  const ctrl = controller || new MarketingController(brevoAdapter);
  const router = createMarketingRoutes({ controller: ctrl });
  return { router, controller: ctrl };
}
