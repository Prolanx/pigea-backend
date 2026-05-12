import MessageTemplate from '@database/models/MessageTemplate.js';
import { DAOError } from '@common/errors.js';

class MessageTemplateDAO {
  async create(templateData) {
    try {
      return await MessageTemplate.create(templateData);
    } catch (error) {
      if (error?.code === 11000) {
        throw new DAOError('Message template with this name already exists', 409);
      }
      throw new DAOError(`Failed to create message template: ${error.message}`);
    }
  }

  async findByMerchant(merchantId) {
    try {
      return await MessageTemplate.find({ merchantId }).sort({ updatedAt: -1 });
    } catch (error) {
      throw new DAOError(`Failed to fetch message templates: ${error.message}`);
    }
  }

  async findById(id, merchantId) {
    try {
      return await MessageTemplate.findOne({ _id: id, merchantId });
    } catch (error) {
      throw new DAOError(`Failed to find message template: ${error.message}`);
    }
  }

  async findByIdWithoutMerchantScope(id) {
    try {
      return await MessageTemplate.findById(id);
    } catch (error) {
      throw new DAOError(`Failed to find message template: ${error.message}`);
    }
  }

  async updateById(id, merchantId, updateData) {
    try {
      return await MessageTemplate.findOneAndUpdate(
        { _id: id, merchantId },
        updateData,
        { new: true, runValidators: true },
      );
    } catch (error) {
      if (error?.code === 11000) {
        throw new DAOError('Message template with this name already exists', 409);
      }
      throw new DAOError(`Failed to update message template: ${error.message}`);
    }
  }

  async deleteById(id, merchantId) {
    try {
      return await MessageTemplate.findOneAndDelete({ _id: id, merchantId });
    } catch (error) {
      throw new DAOError(`Failed to delete message template: ${error.message}`);
    }
  }

  async nameExists(name, merchantId, excludeId = null) {
    try {
      const query = { name, merchantId };
      if (excludeId) query._id = { $ne: excludeId };
      const existing = await MessageTemplate.findOne(query);
      return Boolean(existing);
    } catch (error) {
      throw new DAOError(`Failed to check template name uniqueness: ${error.message}`);
    }
  }
}

export default MessageTemplateDAO;
