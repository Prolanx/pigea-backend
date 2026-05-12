import ContactType from '@database/models/ContactType.js';
import { DAOError } from '@common/errors.js';

/**
 * ContactType Data Access Object
 * Handles all database operations for contact types
 */
class ContactTypeDAO {
  /**
   * Create a new contact type
   * @param {Object} contactTypeData - Contact type data
   * @returns {Promise<Object>} Created contact type
   * @throws {DAOError} If database operation fails
   */
  async create(contactTypeData) {
    try {
      const contactType = await ContactType.create(contactTypeData);
      return contactType;
    } catch (error) {
      if (error.code === 11000) {
        throw new DAOError('Contact type with this name already exists for this merchant', 409);
      }
      throw new DAOError(`Failed to create contact type: ${error.message}`);
    }
  }

  /**
   * Find all contact types for a merchant
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Array>} Array of contact types
   * @throws {DAOError} If database operation fails
   */
  async findByMerchant(merchantId) {
    try {
      const contactTypes = await ContactType.find({ merchantId }).sort({ createdAt: -1 });
      return contactTypes;
    } catch (error) {
      throw new DAOError(`Failed to fetch contact types: ${error.message}`);
    }
  }

  /**
   * Find contact type by name and merchant
   * @param {string} name - Contact type name
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Contact type or null
   * @throws {DAOError} If database operation fails
   */
  async findByName(name, merchantId) {
    try {
      const contactType = await ContactType.findOne({ name, merchantId });
      return contactType;
    } catch (error) {
      throw new DAOError(`Failed to find contact type by name: ${error.message}`);
    }
  }

  /**
   * Find the system-owned General contact group for a merchant.
   * Falls back to legacy General groups for backward compatibility.
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Contact type or null
   * @throws {DAOError} If database operation fails
   */
  async findSystemGeneralGroup(merchantId) {
    try {
      const systemGeneral = await ContactType.findOne({
        merchantId,
        name: 'General',
        isSystemGroup: true,
      });

      if (systemGeneral) {
        return systemGeneral;
      }

      return await ContactType.findOne({ merchantId, name: 'General' });
    } catch (error) {
      throw new DAOError(`Failed to find system General contact type: ${error.message}`);
    }
  }

  /**
   * Find contact type by ID
   * @param {string} id - Contact type ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Contact type or null
   * @throws {DAOError} If database operation fails
   */
  async findById(id, merchantId) {
    try {
      const contactType = await ContactType.findOne({ _id: id, merchantId });
      return contactType;
    } catch (error) {
      throw new DAOError(`Failed to find contact type: ${error.message}`);
    }
  }

  /**
   * Find contact type by ID without merchant scope
   * @param {string} id - Contact type ID
   * @returns {Promise<Object|null>} Contact type or null
   * @throws {DAOError} If database operation fails
   */
  async findByIdWithoutMerchantScope(id) {
    try {
      const contactType = await ContactType.findById(id);
      return contactType;
    } catch (error) {
      throw new DAOError(`Failed to find contact type: ${error.message}`);
    }
  }

  /**
   * Update contact type
   * @param {string} id - Contact type ID
   * @param {string} merchantId - Merchant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated contact type or null
   * @throws {DAOError} If database operation fails
   */
  async updateById(id, merchantId, updateData) {
    try {
      const contactType = await ContactType.findOneAndUpdate(
        { _id: id, merchantId },
        updateData,
        { new: true, runValidators: true }
      );
      return contactType;
    } catch (error) {
      if (error.code === 11000) {
        throw new DAOError('Contact type with this name already exists for this merchant', 409);
      }
      throw new DAOError(`Failed to update contact type: ${error.message}`);
    }
  }

  /**
   * Delete contact type
   * @param {string} id - Contact type ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Deleted contact type or null
   * @throws {DAOError} If database operation fails
   */
  async deleteById(id, merchantId) {
    try {
      const contactType = await ContactType.findOneAndDelete({ _id: id, merchantId });
      return contactType;
    } catch (error) {
      throw new DAOError(`Failed to delete contact type: ${error.message}`);
    }
  }

  /**
   * Count contact types by merchant
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<number>} Contact type count
   * @throws {DAOError} If database operation fails
   */
  async countByMerchant(merchantId) {
    try {
      const count = await ContactType.countDocuments({ merchantId });
      return count;
    } catch (error) {
      throw new DAOError(`Failed to count contact types: ${error.message}`);
    }
  }

  /**
   * Increment or decrement the contactCount for a contact type
   * @param {string} id - Contact type ID
   * @param {string} merchantId - Merchant ID
   * @param {number} delta - Amount to adjust (positive or negative)
   * @returns {Promise<Object|null>} Updated contact type
   * @throws {DAOError} If database operation fails
   */
  async incrementContactCount(id, merchantId, delta) {
    try {
      // Mongo doesn't support a native min/max cap with $inc in a single operation in older versions,
      // so we perform the increment and then ensure the count is not negative.
      const contactType = await ContactType.findOneAndUpdate(
        { _id: id, merchantId },
        { $inc: { contactCount: delta } },
        { new: true }
      );

      if (!contactType) return null;

      if (contactType.contactCount < 0) {
        // Clamp to 0
        contactType.contactCount = 0;
        await contactType.save();
      }

      return contactType;
    } catch (error) {
      throw new DAOError(`Failed to update contact type count: ${error.message}`);
    }
  }
}

export default ContactTypeDAO;
