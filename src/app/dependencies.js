/**
 * Dependency Injection Container
 * Creates and wires up all DAOs, services, controllers, and adapters
 */

import InvoiceModule from '@modules/invoice/_index.js';

import AuthModule from '@modules/auth/_index.js';
import CategoryModule from '@modules/category/_index.js';
import ProductModule from '@modules/product/_index.js';
import CrmModule from '@modules/crm/_index.js';
import InboxModule from '@modules/inbox/_index.js';
import SocialModule from '@modules/social/_index.js';
import MarketingModule from '@modules/marketing/_index.js';
import BusinessInfoModule from '@modules/business-info/_index.js';
import TransactionModule from '@modules/transaction/_index.js';
import TransactionDAOInstance from '@modules/transaction/dao/transaction-dao/_index.js';

// extract classes/functions from module namespaces
// invoice module
const InvoiceDAO = InvoiceModule.dao.InvoiceDAO;
const InvoiceController = InvoiceModule.controller.InvoiceController;
const InvoiceCalculator = InvoiceModule.utils.invoiceCalculator;
const InvoiceUtils = InvoiceModule.utils;

// auth module
const AccountDAO = AuthModule.dao.AccountDAO;
const AuthController = AuthModule.controller.AuthController;
const VerifyResetTokenController = AuthModule.controller.VerifyResetTokenController;
const OnboardingController = AuthModule.controller.OnboardingController;
const TokenGenerator = AuthModule.utils.TokenGenerator;

// category module
const CategoryDAO = CategoryModule.dao.CategoryDAO;
const CategoryController = CategoryModule.controller.CategoryController;

// product module
const ProductDAO = ProductModule.dao.ProductDAO;
const ProductController = ProductModule.controller.ProductController;

// crm module
const FieldDefinitionDAO = CrmModule.dao.FieldDefinitionDAO;
const ContactTypeDAO = CrmModule.dao.ContactTypeDAO;
const ContactDAO = CrmModule.dao.ContactDAO;
const MessageDAO = CrmModule.dao.MessageDAO;
const StatusDAO = CrmModule.dao.StatusDAO;
const FieldDefinitionController = CrmModule.controller.FieldDefinitionController;
const ContactTypeController = CrmModule.controller.ContactTypeController;
const ContactController = CrmModule.controller.ContactController;
const MessageController = CrmModule.controller.MessageController;
const StatusController = CrmModule.controller.StatusController;

// inbox module
const InboxDAO = InboxModule.dao.InboxDAO;
const InboxController = InboxModule.controller.InboxController;

// social module
const SocialChannelDAO = SocialModule.dao.SocialChannelDAO;
const SocialChannelController = SocialModule.controller.SocialChannelController;
const oauthAdapter = SocialModule.utils.oauthAdapter;

// marketing module
const MarketingController = MarketingModule.controller.MarketingController;

// business info module
const BusinessInfoController = BusinessInfoModule.controller.BusinessInfoController;
import * as passwordAdapter from '@adapters/password/password.js';
import * as brevoAdapter from '@adapters/brevo/brevo.js';
import * as jwtAdapter from '@adapters/jwt/jwt.js';
import * as emailAdapter from '@adapters/email/email.js';

/**
 * Creates and returns all application dependencies
 * @returns {Object} Object containing all controllers organized by module
 */
export function createDependencies() {
  // DAOs
  const invoiceDAO = new InvoiceDAO();
  // Ensure TransactionDAOInstance is the correct singleton/DAO instance per codebase pattern
  const transactionDAO = TransactionDAOInstance;
  const accountDAO = new AccountDAO();
  const productDAO = new ProductDAO();
  const categoryDAO = new CategoryDAO();
  const fieldDefinitionDAO = new FieldDefinitionDAO();
  const contactTypeDAO = new ContactTypeDAO();
  const contactDAO = new ContactDAO();
  const messageDAO = new MessageDAO();
  const statusDAO = new StatusDAO();
  const statDAO = null; // stats module deprecated

  // Services
  const invoiceCalculator = new InvoiceCalculator();
  const tokenGenerator = new TokenGenerator();

  // Controllers - Invoice
  const invoiceController = new InvoiceController(
    invoiceDAO,
    invoiceCalculator,
    contactDAO,
    productDAO,
    accountDAO,
    emailAdapter,
    InvoiceUtils,
    transactionDAO,
    fieldDefinitionDAO
  );

  // Controllers - Transaction
  const TransactionController = TransactionModule.controller.TransactionController;
  const transactionController = new TransactionController(transactionDAO, invoiceDAO, InvoiceUtils);

  // Controllers - Auth
  const authController = new AuthController(
    accountDAO,
    passwordAdapter,
    jwtAdapter,
    emailAdapter,
    tokenGenerator
  );
  const verifyResetTokenController = new VerifyResetTokenController(accountDAO);
  const onboardingController = new OnboardingController(accountDAO);

  // Controllers - Business Info
  const businessInfoController = new BusinessInfoController(accountDAO);

  // Controllers - Category & Product
  const categoryController = new CategoryController(categoryDAO, productDAO);
  const productController = new ProductController(productDAO, categoryDAO, businessInfoController);

  // Controllers - CRM
  const fieldDefinitionController = new FieldDefinitionController(fieldDefinitionDAO, contactTypeDAO);
  const contactTypeController = new ContactTypeController(
    contactTypeDAO, 
    fieldDefinitionDAO, 
    contactDAO
  );
  const contactController = new ContactController(
    contactDAO, 
    contactTypeDAO, 
    fieldDefinitionDAO, 
    messageDAO, 
    statusDAO
  );
  const messageController = new MessageController(
    messageDAO, 
    contactDAO, 
    emailAdapter, 
    accountDAO
  );
  const statusController = new StatusController(statusDAO);

  // Controllers - Social
  const channelDAO = new SocialChannelDAO();
  const socialChannelController = new SocialChannelController(channelDAO, oauthAdapter);

  // Controllers - Marketing
  const marketingController = new MarketingController(brevoAdapter);

  // Controllers - Inbox
  const inboxDAO = new InboxDAO();
  const inboxController = new InboxController(inboxDAO, accountDAO);

  // Return organized dependencies
  return {
    invoice: { invoiceController },
    transaction: { transactionController },
    auth: { authController, verifyResetTokenController, onboardingController },
    category: { categoryController },    product: { productController },
    crm: {
      fieldDefinitionController,
      contactTypeController,
      contactController,
      messageController,
      statusController
    },
    stat: { statDAO: null },
    social: { socialChannelController },
    marketing: { marketingController },
    businessInfo: { businessInfoController },
    inbox: { inboxController },
  };
}
