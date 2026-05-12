import { ControllerError, DAOError } from '@common/errors.js';

function mapTemplate(template) {
  return {
    id: template._id,
    name: template.name,
    channel: template.channel,
    content: template.content,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

class MessageTemplateController {
  constructor(messageTemplateDAO) {
    this.messageTemplateDAO = messageTemplateDAO;
  }

  async createMessageTemplate(templateData, merchantId) {
    try {
      const { name, channel = 'all', content } = templateData;

      const nameExists = await this.messageTemplateDAO.nameExists(name, merchantId);
      if (nameExists) {
        throw new ControllerError('Message template with this name already exists', 409);
      }

      const template = await this.messageTemplateDAO.create({
        merchantId,
        name,
        channel,
        content,
      });

      return mapTemplate(template);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        throw error;
      }
      throw new ControllerError(`Failed to create message template: ${error.message}`);
    }
  }

  async getMessageTemplates(merchantId) {
    try {
      const templates = await this.messageTemplateDAO.findByMerchant(merchantId);
      return templates.map(mapTemplate);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        throw error;
      }
      throw new ControllerError(`Failed to get message templates: ${error.message}`);
    }
  }

  async getMessageTemplateById(id, merchantId) {
    try {
      const exists = await this.messageTemplateDAO.findByIdWithoutMerchantScope(id);
      if (!exists) {
        throw new ControllerError('Message template not found', 404);
      }

      const template = await this.messageTemplateDAO.findById(id, merchantId);
      if (!template) {
        throw new ControllerError('You do not have permission to access this message template', 403);
      }

      return mapTemplate(template);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        throw error;
      }
      throw new ControllerError(`Failed to get message template: ${error.message}`);
    }
  }

  async updateMessageTemplate(id, updateData, merchantId) {
    try {
      const exists = await this.messageTemplateDAO.findByIdWithoutMerchantScope(id);
      if (!exists) {
        throw new ControllerError('Message template not found', 404);
      }

      const current = await this.messageTemplateDAO.findById(id, merchantId);
      if (!current) {
        throw new ControllerError('You do not have permission to update this message template', 403);
      }

      if (updateData.name && updateData.name !== current.name) {
        const nameExists = await this.messageTemplateDAO.nameExists(updateData.name, merchantId, id);
        if (nameExists) {
          throw new ControllerError('Message template with this name already exists', 409);
        }
      }

      const updated = await this.messageTemplateDAO.updateById(id, merchantId, updateData);
      return mapTemplate(updated);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        throw error;
      }
      throw new ControllerError(`Failed to update message template: ${error.message}`);
    }
  }

  async deleteMessageTemplate(id, merchantId) {
    try {
      const exists = await this.messageTemplateDAO.findByIdWithoutMerchantScope(id);
      if (!exists) {
        throw new ControllerError('Message template not found', 404);
      }

      const current = await this.messageTemplateDAO.findById(id, merchantId);
      if (!current) {
        throw new ControllerError('You do not have permission to delete this message template', 403);
      }

      const deleted = await this.messageTemplateDAO.deleteById(id, merchantId);
      return mapTemplate(deleted);
    } catch (error) {
      if (error instanceof ControllerError || error instanceof DAOError) {
        throw error;
      }
      throw new ControllerError(`Failed to delete message template: ${error.message}`);
    }
  }
}

export default MessageTemplateController;
