import Message from '@database/models/Message.js';
import { DAOError } from '@common/errors.js';

/**
 * Message Data Access Object
 * Handles all database operations for messages
 */
class MessageDAO {
  /**
   * Create a new message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Created message
   * @throws {DAOError} If database operation fails
   */
  async create(messageData) {
    try {
      const message = await Message.create(messageData);
      return message;
    } catch (error) {
      throw new DAOError(`Failed to create message: ${error.message}`);
    }
  }

  /**
   * Find all messages for a contact (chronological order)
   * @param {string} contactId - Contact ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Array>} Array of messages
   * @throws {DAOError} If database operation fails
   */
  async findByContact(contactId, merchantId) {
    try {
      const messages = await Message.find({ contactId, merchantId }).sort({ sentAt: 1 });
      return messages;
    } catch (error) {
      throw new DAOError(`Failed to fetch messages: ${error.message}`);
    }
  }

  /**
   * Find message by ID
   * @param {string} id - Message ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object|null>} Message or null
   * @throws {DAOError} If database operation fails
   */
  async findById(id, merchantId) {
    try {
      const message = await Message.findOne({ _id: id, merchantId });
      return message;
    } catch (error) {
      throw new DAOError(`Failed to find message: ${error.message}`);
    }
  }

  /**
   * Delete all messages for a contact
   * @param {string} contactId - Contact ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object>} Delete result
   * @throws {DAOError} If database operation fails
   */
  async deleteByContact(contactId, merchantId) {
    try {
      const result = await Message.deleteMany({ contactId, merchantId });
      return result;
    } catch (error) {
      throw new DAOError(`Failed to delete messages: ${error.message}`);
    }
  }
}

export default MessageDAO;
