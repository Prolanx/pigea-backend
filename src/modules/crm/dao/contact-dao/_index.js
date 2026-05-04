import mongoose from 'mongoose';
import Contact from '@database/models/Contact.js';
import { DAOError } from '@common/errors.js';

/**
 * Contact Data Access Object
 * Handles all database operations for contacts
 */
class ContactDAO {
  /**
   * Create a new contact
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Created contact
   * @throws {DAOError} If database operation fails
   */
  async create(contactData) {
    try {
      const contact = await Contact.create(contactData);
      return contact;
    } catch (error) {
      throw new DAOError(`Failed to create contact: ${error.message}`);
    }
  }

  /**
   * Find all contacts for a merchant
   * @param {string} merchantId - Merchant ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of contacts
   * @throws {DAOError} If database operation fails
   */
  async findByMerchant(merchantId, options = {}) {
    try {
      const { contactTypeId, status, source, sortBy = '-createdAt', limit } = options;

      const query = { merchantId };
      if (contactTypeId) query.contactTypeId = contactTypeId;
      if (status) query.status = status;
      if (source) query.source = source;

      let queryBuilder = Contact.find(query)
        .populate('contactTypeId', 'name description fields')
        .sort(sortBy);
      if (limit) queryBuilder = queryBuilder.limit(limit);

      const contacts = await queryBuilder;
      return contacts;
    } catch (error) {
      throw new DAOError(`Failed to fetch contacts: ${error.message}`);
    }
  }

  /**
   * Find contact by ID
   * @param {string} id - Contact ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Contact or null
   * @throws {DAOError} If database operation fails
   */
  async findById(id, merchantId) {
    try {
      const contact = await Contact.findOne({ _id: id, merchantId })
        .populate('contactTypeId', 'name description fields');
      return contact;
    } catch (error) {
      throw new DAOError(`Failed to find contact: ${error.message}`);
    }
  }

  /**
   * Find contact by ID without merchant scope
   * @param {string} id - Contact ID
   * @returns {Promise<Object|null>} Contact or null
   * @throws {DAOError} If database operation fails
   */
  async findByIdWithoutMerchantScope(id) {
    try {
      const contact = await Contact.findById(id);
      return contact;
    } catch (error) {
      throw new DAOError(`Failed to find contact: ${error.message}`);
    }
  }

  /**
   * Find contact by email field in data
   * @param {string} merchantId - Merchant ID
   * @param {string} contactTypeId - Contact type ID
   * @param {string} email - Email value
   * @returns {Promise<Object|null>} Contact or null
   * @throws {DAOError} If database operation fails
   */
  async findByEmail(merchantId, contactTypeId, email) {
    try {
      const contact = await Contact.findOne({
        merchantId,
        contactTypeId,
        'data.sys_email': email.toLowerCase(),
      });
      return contact;
    } catch (error) {
      throw new DAOError(`Failed to find contact by email: ${error.message}`);
    }
  }

  /**
   * Update contact
   * @param {string} id - Contact ID
   * @param {string} merchantId - Merchant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated contact or null
   * @throws {DAOError} If database operation fails
   */
  async updateById(id, merchantId, updateData) {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: id, merchantId },
        updateData,
        { new: true, runValidators: true }
      );
      return contact;
    } catch (error) {
      throw new DAOError(`Failed to update contact: ${error.message}`);
    }
  }

  /**
   * Delete contact
   * @param {string} id - Contact ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Deleted contact or null
   * @throws {DAOError} If database operation fails
   */
  async deleteById(id, merchantId) {
    try {
      const contact = await Contact.findOneAndDelete({ _id: id, merchantId });
      return contact;
    } catch (error) {
      throw new DAOError(`Failed to delete contact: ${error.message}`);
    }
  }

  /**
   * Count contacts by merchant
   * @param {string} merchantId - Merchant ID
   * @param {Object} filter - Optional filter
   * @returns {Promise<number>} Contact count
   * @throws {DAOError} If database operation fails
   */
  async countByMerchant(merchantId, filter = {}) {
    try {
      const query = { merchantId, ...filter };
      const count = await Contact.countDocuments(query);
      return count;
    } catch (error) {
      throw new DAOError(`Failed to count contacts: ${error.message}`);
    }
  }

  /**
   * Get contact summary metrics for a merchant.
   * @param {string} merchantId - Merchant ID
   * @param {number} days - Rolling window for new-contact metric
   * @returns {Promise<Object>} Summary metrics
   * @throws {DAOError} If database operation fails
   */
  async getContactSummary(merchantId, days = 30) {
    try {
      const merchantObjectId = new mongoose.Types.ObjectId(merchantId);
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - days);

      const [summary] = await Contact.aggregate([
        {
          $match: {
            merchantId: merchantObjectId,
          },
        },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            newLast30Days: {
              $sum: {
                $cond: [{ $gte: ['$createdAt', windowStart] }, 1, 0],
              },
            },
            uniqueGroupIds: { $addToSet: '$contactTypeId' },
          },
        },
        {
          $project: {
            _id: 0,
            totalCount: 1,
            newLast30Days: 1,
            groupCount: { $size: '$uniqueGroupIds' },
          },
        },
      ]);

      return summary || {
        totalCount: 0,
        newLast30Days: 0,
        groupCount: 0,
      };
    } catch (error) {
      throw new DAOError(`Failed to retrieve contact summary: ${error.message}`);
    }
  }

  /**
   * Delete all contacts for a contact type
   * @param {string} contactTypeId - Contact type ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object>} Delete result
   * @throws {DAOError} If database operation fails
   */
  async deleteByContactType(contactTypeId, merchantId) {
    try {
      const result = await Contact.deleteMany({ contactTypeId, merchantId });
      return result;
    } catch (error) {
      throw new DAOError(`Failed to delete contacts: ${error.message}`);
    }
  }
}

export default ContactDAO;
