import Status from '@database/models/Status.js';
import { DAOError } from '@common/errors.js';

/**
 * Status Data Access Object
 * Handles database operations for CUSTOM statuses only
 */
class StatusDAO {
  /**
   * Create a new custom status
   * @param {Object} statusData - Status data
   * @returns {Promise<Object>} Created status
   * @throws {DAOError} If database operation fails
   */
  async create(statusData) {
    try {
      const status = await Status.create(statusData);
      return status;
    } catch (error) {
      if (error.code === 11000) {
        throw new DAOError('A status with this name already exists', 409);
      }
      throw new DAOError(`Failed to create status: ${error.message}`);
    }
  }

  /**
   * Find all custom statuses for a merchant
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Array>} Array of custom statuses
   * @throws {DAOError} If database operation fails
   */
  async findByMerchant(merchantId) {
    try {
      const statuses = await Status.find({ merchantId }).sort({ createdAt: 1 });
      return statuses;
    } catch (error) {
      throw new DAOError(`Failed to fetch statuses: ${error.message}`);
    }
  }

  /**
   * Find custom status by ID
   * @param {string} id - Status ID
   * @param {string} merchantId - Merchant ID for authorization
   * @returns {Promise<Object|null>} Status or null
   * @throws {DAOError} If database operation fails
   */
  async findById(id, merchantId) {
    try {
      const status = await Status.findOne({ _id: id, merchantId });
      return status;
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw new DAOError(`Failed to fetch status: ${error.message}`);
    }
  }

  /**
   * Find custom status by ID without merchant scope (for existence check)
   * @param {string} id - Status ID
   * @returns {Promise<Object|null>} Status or null
   * @throws {DAOError} If database operation fails
   */
  async findByIdWithoutMerchantScope(id) {
    try {
      const status = await Status.findById(id);
      return status;
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw new DAOError(`Failed to fetch status: ${error.message}`);
    }
  }

  /**
   * Update custom status by ID
   * @param {string} id - Status ID
   * @param {string} merchantId - Merchant ID for authorization
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated status or null
   * @throws {DAOError} If database operation fails
   */
  async updateById(id, merchantId, updateData) {
    try {
      const status = await Status.findOneAndUpdate(
        { _id: id, merchantId },
        updateData,
        { new: true, runValidators: true }
      );
      return status;
    } catch (error) {
      if (error.code === 11000) {
        throw new DAOError('A status with this name already exists', 409);
      }
      throw new DAOError(`Failed to update status: ${error.message}`);
    }
  }

  /**
   * Delete custom status by ID
   * @param {string} id - Status ID
   * @param {string} merchantId - Merchant ID for authorization
   * @returns {Promise<Object|null>} Deleted status or null
   * @throws {DAOError} If database operation fails
   */
  async deleteById(id, merchantId) {
    try {
      const status = await Status.findOneAndDelete({ _id: id, merchantId });
      return status;
    } catch (error) {
      throw new DAOError(`Failed to delete status: ${error.message}`);
    }
  }

  /**
   * Count contacts using a specific status
   * @param {string} statusId - Status ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<number>} Count of contacts
   * @throws {DAOError} If database operation fails
   */
  async countContactsUsingStatus(statusId, merchantId) {
    try {
      const Contact = (await import('@database/models/Contact.js')).default;
      const count = await Contact.countDocuments({ status: statusId, merchantId });
      return count;
    } catch (error) {
      throw new DAOError(`Failed to count contacts: ${error.message}`);
    }
  }
}

export default StatusDAO;
