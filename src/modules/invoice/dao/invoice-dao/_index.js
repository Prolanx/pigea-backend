import mongoose from 'mongoose';
import Invoice from '@database/models/Invoice.js';
import { DAOError } from '@common/errors.js';
import { generateInvoiceNumber } from '@modules/invoice/utils/invoice-number-generator.util.js';

/**
 * Data Access Object for Invoice operations
 * Handles all database interactions for invoices
 */
class InvoiceDAO {
  /**
   * Create a new invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} Created invoice
   * @throws {DAOError} If database operation fails
   */
  async create(invoiceData) {
    try {
      // Generate invoice number if not provided (using atomic counter)
      if (!invoiceData.invoiceNumber) {
        invoiceData.invoiceNumber = await generateInvoiceNumber(invoiceData.merchantId);
      }

      const invoice = new Invoice(invoiceData);
      const saved = await invoice.save();

      // If this is the root/original invoice (no rootInvoiceId), set rootInvoiceId to itself and initialize statusHistory
      if (!saved.rootInvoiceId) {
        saved.rootInvoiceId = saved._id;
        saved.versionNumber = 1;
        saved.statusHistory = saved.statusHistory && saved.statusHistory.length ? saved.statusHistory : [{ status: saved.status, changedAt: new Date() }];
        await saved.save();
      }

      return saved;
    } catch (error) {
      throw new DAOError('Failed to create invoice in database');
    }
  }

  /**
   * Find invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise<Object|null>} Invoice or null
   * @throws {DAOError} If database operation fails
   */
  async findById(id) {
    try {
      // Populate the referenced Contact document and its contactType so callers can remap custom field ids -> names.
      return await Invoice.findById(id).populate({ path: 'customerId', populate: { path: 'contactTypeId', select: 'name description fields' } });
    } catch (error) {
      throw new DAOError('Failed to find invoice by ID');
    }
  }

  async findByInvoiceNumber(invoiceNumber) {
    try {
      return await Invoice.findOne({ invoiceNumber }).populate({ path: 'customerId', populate: { path: 'contactTypeId', select: 'name description fields' } });
    } catch (error) {
      throw new DAOError('Failed to find invoice by number');
    }
  }

  /**
   * Find versions for a root invoice id
   * @param {string} rootId - Root invoice id
   * @returns {Promise<Array>} Versions sorted by versionNumber desc
   */
  async findVersionsByRoot(rootId) {
    try {
      // Populate the referenced Contact document and its contactType so callers can remap custom field ids -> names.
      return await Invoice.find({ rootInvoiceId: rootId }).sort({ versionNumber: -1 }).populate({ path: 'customerId', populate: { path: 'contactTypeId', select: 'name description fields' } });
    } catch (error) {
      throw new DAOError('Failed to find invoice versions');
    }
  }

  /**
   * Find invoice by ID without merchant scope check
   * @param {string} id - Invoice ID
   * @returns {Promise<Object|null>} Invoice or null
   * @throws {DAOError} If database operation fails
   */
  async findByIdWithoutMerchantScope(id) {
    try {
      // Populate the referenced Contact document and its contactType so callers can remap custom field ids -> names.
      return await Invoice.findById(id).populate({ path: 'customerId', populate: { path: 'contactTypeId', select: 'name description fields' } });
    } catch (error) {
      throw new DAOError('Failed to find invoice by ID');
    }
  }

  /**
   * Delete invoice by ID for a specific merchant
   * @param {string} id - Invoice ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Deleted invoice or null
   * @throws {DAOError} If database operation fails
   */
  async deleteById(id, merchantId) {
    try {
      return await Invoice.findOneAndDelete({ _id: id, merchantId });
    } catch (error) {
      throw new DAOError('Failed to delete invoice in database');
    }
  }

  /**
   * Delete all versions for a root invoice id (hard delete)
   * @param {string} rootId - Root invoice id or specific id
   * @param {string} merchantId - Merchant id
   */
  async deleteVersionsByRoot(rootId, merchantId) {
    try {
      // Delete any doc where rootInvoiceId == rootId OR _id == rootId and merchantId matches
      const res = await Invoice.deleteMany({ $and: [ { $or: [ { rootInvoiceId: rootId }, { _id: rootId } ] }, { merchantId } ] });
      return res;
    } catch (error) {
      throw new DAOError('Failed to delete invoice versions in database');
    }
  }

  /**
   * Update invoice by ID ensuring merchant scope
   * @param {string} id - Invoice ID
   * @param {string} merchantId - Merchant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated invoice or null
   * @throws {DAOError} If database operation fails
   */
  async updateByIdWithMerchantScope(id, merchantId, updateData) {
    try {
      return await Invoice.findOneAndUpdate(
        { _id: id, merchantId },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new DAOError('Failed to update invoice in database');
    }
  }

  /**
   * Create a new version derived from an existing invoice
   * @param {Object} previousInvoice - Previous invoice document
   * @param {Object} data - New invoice data
   * @param {string} merchantId - Merchant id
   */
  async createVersion(previousInvoice, data, merchantId) {
    try {
      const versionNumber = (previousInvoice.versionNumber || 1) + 1;
      const rootInvoiceId = previousInvoice.rootInvoiceId || previousInvoice._id;

      // Build new invoice data by inheriting base fields from previous and overriding with provided data
      const base = {
        invoiceNumber: previousInvoice.invoiceNumber,
        customerId: previousInvoice.customerId,
        customerName: previousInvoice.customerName,
        customerEmail: previousInvoice.customerEmail,
        invoiceCategory: previousInvoice.invoiceCategory,
        currency: previousInvoice.currency,
        orderId: previousInvoice.orderId,
        productMeta: previousInvoice.productMeta,
        items: previousInvoice.items,
        subtotal: previousInvoice.subtotal,
        tax: previousInvoice.tax,
        total: previousInvoice.total,
        dueDate: previousInvoice.dueDate,
        notes: previousInvoice.notes,
        type: previousInvoice.type,
      };
      const newData = {
        ...base,
        ...data,
        merchantId,
        rootInvoiceId,
        previousVersionId: previousInvoice._id,
        versionNumber,
        isLatest: true,
        statusHistory: data.statusHistory && data.statusHistory.length ? data.statusHistory : [{ status: data.status || previousInvoice.status, changedAt: new Date() }]
      };

      const newInvoice = new Invoice(newData);

      // Create new version FIRST (if this fails, old invoice remains untouched)
      const saved = await newInvoice.save();
      
      // Only mark previous as not latest AFTER new version successfully created
      await Invoice.updateOne({ _id: previousInvoice._id }, { isLatest: false });
      
      return saved;
    } catch (error) {
      throw new DAOError('Failed to create invoice version');
    }
  }

  /**
   * Find all invoices (sorted by latest first)
   * @returns {Promise<Array>} Array of invoices
   * @throws {DAOError} If database operation fails
   */
  async findAll(merchantId = null) {
    try {
      // Return only the latest version per invoice (isLatest = true)
      const query = { isLatest: true };
      if (merchantId) query.merchantId = merchantId;
      // Populate the Contact and its ContactType (so callers can remap custom field ids -> names)
      return await Invoice.find(query)
        .sort({ createdAt: -1 })
        .populate({ path: 'customerId', populate: { path: 'contactTypeId', select: 'name description fields' } });
    } catch (error) {
      throw new DAOError('Failed to retrieve invoices from database');
    }
  }

  async getInvoiceSummary(merchantId = null) {
    try {
      const match = { isLatest: true };
      if (merchantId) {
        match.merchantId = new mongoose.Types.ObjectId(merchantId);
      }

      const summary = await Invoice.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            paidCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, 1, 0],
              },
            },
            unpaidCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0],
              },
            },
            paidAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0],
              },
            },
            unpaidAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'unpaid'] }, '$total', 0],
              },
            },
            offlineCount: {
              $sum: {
                $cond: [{ $eq: ['$type', 'manual'] }, 1, 0],
              },
            },
            onlineCount: {
              $sum: {
                $cond: [{ $ne: ['$type', 'manual'] }, 1, 0],
              },
            },
          },
        },
      ]);

      if (!summary || !summary.length) {
        return {
          totalCount: 0,
          totalAmount: 0,
          paidCount: 0,
          unpaidCount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          offlineCount: 0,
          onlineCount: 0,
        };
      }

      const [{
        totalCount,
        totalAmount,
        paidCount,
        unpaidCount,
        paidAmount,
        unpaidAmount,
        offlineCount,
        onlineCount,
      }] = summary;

      return {
        totalCount,
        totalAmount,
        paidCount,
        unpaidCount,
        paidAmount,
        unpaidAmount,
        offlineCount,
        onlineCount,
      };
    } catch (error) {
      throw new DAOError('Failed to summarize invoice counts');
    }
  }

  /**
   * Update invoice by ID
   * @param {string} id - Invoice ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated invoice or null
   * @throws {DAOError} If database operation fails
   */
  async updateById(id, updateData) {
    try {
      return await Invoice.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new DAOError('Failed to update invoice in database');
    }
  }
}

export default InvoiceDAO;
