/**
 * Routes Registration
 * Configures and mounts all application routes
 */

import { createOnboardingRoutes } from '@modules/auth/routes/onboarding/onboarding.route.js';

import InvoiceModule from '@modules/invoice/_index.js';
import AuthModule from '@modules/auth/_index.js';
import CategoryModule from '@modules/category/_index.js';
import ProductModule from '@modules/product/_index.js';
import CrmModule from '@modules/crm/_index.js';
import InboxModule from '@modules/inbox/_index.js';
import SocialModule from '@modules/social/_index.js';
import MarketingModule from '@modules/marketing/_index.js';
import BusinessInfoModule from '@modules/business-info/_index.js';
import StatModule from '@modules/stat/_index.js';
import TransactionModule from '@modules/transaction/_index.js';
import createStorageRoutes from '@modules/storage/routes/storage.routes.js';
import database from '@database/database.js';

// route factories (namespace exports)
const { createInvoiceRoutes } = InvoiceModule.routes;
const { createAuthRoutes, createVerifyResetTokenRoutes } = AuthModule.routes;
const { createCategoryRoutes } = CategoryModule.routes;
const { createProductRoutes } = ProductModule.routes;
const { createCrmRoutes } = CrmModule.routes;
const { createInboxRoutes } = InboxModule.routes;
const { createChannelRoutes } = SocialModule.routes;
const { createMarketingRoutes } = MarketingModule.routes;
const { createBusinessInfoRoutes } = BusinessInfoModule.routes;
const { createStatRoutes } = StatModule.routes;
const { createTransactionRoutes } = TransactionModule.routes;

/**
 * Registers all application routes on the Express app
 * @param {Express.Application} app - Express application instance
 * @param {Object} dependencies - Dependency container with all controllers
 */
export function registerRoutes(app, dependencies) {
  // Auth routes
  app.use('/auth', createAuthRoutes(dependencies.auth.authController));
  app.use('/auth/verify-reset-token', createVerifyResetTokenRoutes(dependencies.auth.verifyResetTokenController));

  // Onboarding route
  app.use('/onboarding', createOnboardingRoutes(dependencies.auth.onboardingController));

  // Invoice routes
  app.use('/invoices', createInvoiceRoutes(dependencies.invoice.invoiceController));

  // Category routes
  app.use('/categories', createCategoryRoutes(dependencies.category.categoryController));

  // Product routes
  app.use('/products', createProductRoutes(dependencies.product.productController));

  // CRM routes
  app.use('/crm', createCrmRoutes({
    fieldDefinitionController: dependencies.crm.fieldDefinitionController,
    contactTypeController: dependencies.crm.contactTypeController,
    contactController: dependencies.crm.contactController,
    messageController: dependencies.crm.messageController,
    statusController: dependencies.crm.statusController
  }));

  // Social routes
  app.use('/social/channels', createChannelRoutes(dependencies.social.socialChannelController));

  // Marketing routes
  app.use('/marketing', createMarketingRoutes({ controller: dependencies.marketing.marketingController }));

  // Business info (merchant-scoped account sub-document)
  app.use('/business-info', createBusinessInfoRoutes(dependencies.businessInfo.businessInfoController));

  // Application stats/metrics (deprecated - removed)
  // app.use('/stats', ...)

  // Transactions module
  app.use('/transactions', createTransactionRoutes(dependencies.transaction.transactionController));

  // Storage — signed URL generation
  app.use('/storage', createStorageRoutes());

  // Inbox routes (webhook + merchant messages)
  app.use('/inbox', createInboxRoutes(dependencies.inbox.inboxController));

  // Health & Status endpoints
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: database.isConnected() ? 'connected' : 'disconnected'
    });
  });

  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Pigea API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/health',
        auth: '/auth',
        invoices: '/invoices',
        transactions: '/transactions',
        categories: '/categories',
        products: '/products',
        crm: '/crm',
        inbox: '/inbox',
        marketing: '/marketing',
        social: '/social/channels'
      }
    });
  });
}
