import FieldDefinition from '@database/models/FieldDefinition.js';
import { DAOError } from '@common/errors.js';

/**
 * FieldDefinition Data Access Object
 * Handles all database operations for custom field definitions
 */
class FieldDefinitionDAO {
  /**
   * Create a new field definition
   * @param {Object} fieldData - Field definition data
   * @returns {Promise<Object>} Created field definition
   * @throws {DAOError} If database operation fails
   */
  async create(fieldData) {
    try {
      const field = await FieldDefinition.create(fieldData);
      return field;
    } catch (error) {
      if (error.code === 11000) {
        throw new DAOError(`Field with name "${fieldData.name}" already exists for this merchant`, 409);
      }
      throw new DAOError(`Failed to create field definition: ${error.message}`);
    }
  }

  /**
   * Find all field definitions for a merchant
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Array>} Array of field definitions
   * @throws {DAOError} If database operation fails
   */
  async findByMerchant(merchantId) {
    try {
      const fields = await FieldDefinition.find({ merchantId }).sort({ createdAt: 1 });
      return fields;
    } catch (error) {
      throw new DAOError(`Failed to fetch field definitions: ${error.message}`);
    }
  }

  /**
   * Find field definition by ID
   * @param {string} id - Field definition ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Field definition or null
   * @throws {DAOError} If database operation fails
   */
  async findById(id, merchantId) {
    try {
      const field = await FieldDefinition.findOne({ _id: id, merchantId });
      return field;
    } catch (error) {
      // Handle invalid ObjectId format
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return null; // Return null for invalid ID format (treated as not found)
      }
      throw new DAOError(`Failed to find field definition: ${error.message}`);
    }
  }

  /**
   * Find field definition by name
   * @param {string} name - Field name
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Field definition or null
   * @throws {DAOError} If database operation fails
   */
  async findByName(name, merchantId) {
    try {
      const field = await FieldDefinition.findOne({ name, merchantId });
      return field;
    } catch (error) {
      throw new DAOError(`Failed to find field definition: ${error.message}`);
    }
  }

  /**
   * Update field definition
   * @param {string} id - Field definition ID
   * @param {string} merchantId - Merchant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated field definition or null
   * @throws {DAOError} If database operation fails
   */
  async updateById(id, merchantId, updateData) {
    try {
      const field = await FieldDefinition.findOneAndUpdate(
        { _id: id, merchantId },
        updateData,
        { new: true, runValidators: true }
      );
      return field;
    } catch (error) {
      throw new DAOError(`Failed to update field definition: ${error.message}`);
    }
  }

  /**
   * Delete field definition
   * @param {string} id - Field definition ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Deleted field definition or null
   * @throws {DAOError} If database operation fails
   */
  async deleteById(id, merchantId) {
    try {
      const field = await FieldDefinition.findOneAndDelete({ _id: id, merchantId });
      return field;
    } catch (error) {
      throw new DAOError(`Failed to delete field definition: ${error.message}`);
    }
  }
}

export default FieldDefinitionDAO;
