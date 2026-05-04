import { ControllerError, DAOError } from '@common/errors.js';
import { createInvoiceAction } from './createInvoice.js';
import { getAllInvoicesAction } from './getAllInvoices.js';
import { getInvoiceByIdAction } from './getInvoiceById.js';
import { getInvoiceByNumberAction } from './getInvoiceByNumber.js';
import { processInvoicePaymentAction } from './processInvoicePayment.js';
import { updateInvoiceStatusAction } from './updateInvoiceStatus.js';
import { updateInvoiceAction } from './updateInvoice.js';
import { deleteInvoiceAction } from './deleteInvoice.js';
import { getInvoiceVersionsAction } from './getInvoiceVersions.js';
import { getInvoiceSummaryAction } from './getInvoiceSummary.js';

/**
 * Invoice Controller - Pure JavaScript business logic
 * DAO is injected via constructor for dependency injection
 */
class InvoiceController {
  constructor(invoiceDAO, invoiceCalculator, contactDAO, productDAO, accountDAO, emailAdapter, utils, transactionDAO, fieldDefinitionDAO) {
    this.invoiceDAO = invoiceDAO;
    this.invoiceCalculator = invoiceCalculator;
    this.contactDAO = contactDAO;
    this.productDAO = productDAO;
    this.accountDAO = accountDAO;
    this.emailAdapter = emailAdapter;
    this.utils = utils;
    this.transactionDAO = transactionDAO;
    this.fieldDefinitionDAO = fieldDefinitionDAO;
  }

  /**
   * Create a new invoice
   * @param {Object} invoiceData - Invoice data from request
   * @returns {Promise<Object>} Created invoice
   * @throws {ControllerError|DAOError} If invoice creation fails
   */
  async createInvoice(invoiceData, merchantId) {
    return createInvoiceAction(this, invoiceData, merchantId);
  }

  /**
   * Get all invoices (sorted by latest first)
   * @returns {Promise<Array>} Array of invoices
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getAllInvoices(merchantId = null) {
    return getAllInvoicesAction(this, merchantId);
  }

  /**
   * Get invoice by ID (QUERY operation)
   * @param {string} id - Invoice ID
   * @returns {Promise<Object|null>} Invoice data or null if not found
   * @throws {ControllerError|DAOError} If retrieval fails or permission denied
   */
  async getInvoiceById(id, merchantId = null) {
    return getInvoiceByIdAction(this, id, merchantId);
  }

  async getInvoiceByNumber(invoiceNumber) {
    return getInvoiceByNumberAction(this, invoiceNumber);
  }

  async processInvoicePayment(paymentData) {
    return processInvoicePaymentAction(this, paymentData);
  }

  async getInvoiceSummary(merchantId = null) {
    return getInvoiceSummaryAction(this, merchantId);
  }

  /**
   * Update invoice status
   * @param {string} id - Invoice ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated invoice
   * @throws {ControllerError|DAOError} If invoice not found or update fails
   */
  async updateInvoiceStatus(id, status, merchantId) {
    return updateInvoiceStatusAction(this, id, status, merchantId);
  }

  /**
   * Update entire invoice (merchant-scoped)
   * @param {string} id - Invoice ID
   * @param {Object} data - Data to update
   * @param {string} merchantId - Merchant ID
   */
  async updateInvoice(id, data, merchantId) {
    return updateInvoiceAction(this, id, data, merchantId);
  }

  /**
   * Delete invoice
   * @param {string} id - Invoice ID
   * @param {string} merchantId - Merchant ID
   */
  async deleteInvoice(id, merchantId) {
    return deleteInvoiceAction(this, id, merchantId);
  }

  /**
   * Get version history for a root invoice id (QUERY operation)
   * @param {string} id - root invoice id or latest invoice id
   * @returns {Promise<Array|null>} Array of versions or null if invoice not found
   */
  async getInvoiceVersions(id) {
    return getInvoiceVersionsAction(this, id);
  }
}

export default InvoiceController;
