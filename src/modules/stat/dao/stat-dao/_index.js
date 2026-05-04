import Stat from '@database/models/Stat.js';
import { DAOError } from '@common/errors.js';

/**
 * Stat DAO
 * Handles all database operations for the Stat document associated with a
 * merchant account.
 */
class StatDAO {
  /**
   * Ensure a stat record exists for the given merchant.
   * @param {string} merchantId
   * @returns {Promise<Object>} the stat document
   */
  async ensureForMerchant(merchantId) {
    try {
      let stat = await Stat.findOne({ merchantId });
      if (!stat) {
        stat = await Stat.create({ merchantId });
      }
      return stat;
    } catch (error) {
      throw new DAOError(`Failed to ensure stat record: ${error.message}`);
    }
  }

  /**
   * Increment or decrement the custom field count.
   * @param {string} merchantId
   * @param {number} delta
   * @returns {Promise<Object>} updated stat document
   */
  async incrementCustomFieldCount(merchantId, delta) {
    try {
      const stat = await Stat.findOneAndUpdate(
        { merchantId },
        { $inc: { customFieldCount: delta } },
        { new: true, upsert: true }
      );
      return stat;
    } catch (error) {
      throw new DAOError(`Failed to update custom field count: ${error.message}`);
    }
  }

  /**
   * Increment or decrement the status count.
   * @param {string} merchantId
   * @param {number} delta
   * @returns {Promise<Object>} updated stat document
   */
  async incrementStatusCount(merchantId, delta) {
    try {
      const stat = await Stat.findOneAndUpdate(
        { merchantId },
        { $inc: { statusCount: delta } },
        { new: true, upsert: true }
      );
      return stat;
    } catch (error) {
      throw new DAOError(`Failed to update status count: ${error.message}`);
    }
  }

  /**
   * Increment or decrement the overall contact count.
   * @param {string} merchantId
   * @param {number} delta
   * @returns {Promise<Object>} updated stat document
   */
  async incrementContactCount(merchantId, delta) {
    try {
      const stat = await Stat.findOneAndUpdate(
        { merchantId },
        { $inc: { contactCount: delta } },
        { new: true, upsert: true }
      );
      return stat;
    } catch (error) {
      throw new DAOError(`Failed to update contact count: ${error.message}`);
    }
  }

  /**
   * Retrieve stat document for merchant
   */
  async findByMerchant(merchantId) {
    try {
      return await Stat.findOne({ merchantId });
    } catch (error) {
      throw new DAOError(`Failed to fetch stat: ${error.message}`);
    }
  }
}

export default StatDAO;
