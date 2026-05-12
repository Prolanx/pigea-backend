import { ControllerError, DAOError } from '@common/errors.js';
import { isSystemField, getSystemFieldById } from '@modules/crm/constants/system-fields.js';
import {
  buildCustomFieldMap,
  toContactTypeResponse,
} from '@modules/crm/utils/contact-type-response.util.js';

/**
 * ContactType Controller - Business logic for contact types
 * Dependencies injected via constructor
 */
class ContactTypeController {
  constructor(contactTypeDAO, fieldDefinitionDAO, contactDAO) {
    this.contactTypeDAO = contactTypeDAO;
    this.fieldDefinitionDAO = fieldDefinitionDAO;
    this.contactDAO = contactDAO;
  }

  /**
   * Create a contact type
   * @param {Object} contactTypeData - Contact type data
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Created contact type
   * @throws {ControllerError|DAOError} If creation fails
   */
  async createContactType(contactTypeData, merchantId) {
    try {
      const { name, description, fields } = contactTypeData;

      // Auto-inject sys_email as required field (CRM requires email for messaging)
      const fieldsWithEmail = this.ensureSystemFields(fields);

      // Validate fields exist (system or custom)
      await this.validateFields(fieldsWithEmail, merchantId);

      // Create contact type
      const contactType = await this.contactTypeDAO.create({
        merchantId,
        name,
        description,
        fields: fieldsWithEmail,
        isSystemGroup: false,
      });

      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      return toContactTypeResponse(contactType, customFieldMap);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to create contact type: ${error.message}`);
    }
  }

  /**
   * Get all contact types for merchant
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Array>} Array of contact types
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getContactTypes(merchantId) {
    try {
      const contactTypes = await this.contactTypeDAO.findByMerchant(merchantId);
      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      return contactTypes.map((ct) => toContactTypeResponse(ct, customFieldMap));
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get contact types: ${error.message}`);
    }
  }

  /**
   * Get contact type by ID
   * @param {string} id - Contact type ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Contact type
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getContactTypeById(id, merchantId) {
    try {
      const contactTypeExists = await this.contactTypeDAO.findByIdWithoutMerchantScope(id);
      if (!contactTypeExists) {
        throw new ControllerError('Contact type not found', 404);
      }

      const contactType = await this.contactTypeDAO.findById(id, merchantId);
      if (!contactType) {
        throw new ControllerError('You do not have permission to access this contact type', 403);
      }

      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      return toContactTypeResponse(contactType, customFieldMap);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get contact type: ${error.message}`);
    }
  }

  /**
   * Update contact type
   * @param {string} id - Contact type ID
   * @param {Object} updateData - Data to update
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Updated contact type
   * @throws {ControllerError|DAOError} If update fails
   */
  async updateContactType(id, updateData, merchantId) {
    try {
      const contactTypeExists = await this.contactTypeDAO.findByIdWithoutMerchantScope(id);
      if (!contactTypeExists) {
        throw new ControllerError('Contact type not found', 404);
      }

      const existingContactType = await this.contactTypeDAO.findById(id, merchantId);
      if (!existingContactType) {
        throw new ControllerError('You do not have permission to update this contact type', 403);
      }

      if (existingContactType.isSystemGroup) {
        throw new ControllerError('Cannot modify system contact groups', 403);
      }

      // Never allow clients to toggle system-group ownership.
      if (Object.prototype.hasOwnProperty.call(updateData, 'isSystemGroup')) {
        delete updateData.isSystemGroup;
      }

      // Validate fields if provided
      if (updateData.fields) {
        // Auto-inject sys_email as required field
        updateData.fields = this.ensureSystemFields(updateData.fields);
        await this.validateFields(updateData.fields, merchantId);
      }

      const contactType = await this.contactTypeDAO.updateById(id, merchantId, updateData);

      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      return toContactTypeResponse(contactType, customFieldMap);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to update contact type: ${error.message}`);
    }
  }

  /**
   * Delete contact type
   * @param {string} id - Contact type ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Deleted contact type
   * @throws {ControllerError|DAOError} If deletion fails
   */
  async deleteContactType(id, merchantId) {
    try {
      const contactTypeExists = await this.contactTypeDAO.findByIdWithoutMerchantScope(id);
      if (!contactTypeExists) {
        throw new ControllerError('Contact type not found', 404);
      }

      const contactType = await this.contactTypeDAO.findById(id, merchantId);
      if (!contactType) {
        throw new ControllerError('You do not have permission to delete this contact type', 403);
      }

      if (contactType.isSystemGroup) {
        throw new ControllerError('Cannot modify system contact groups', 403);
      }

      // Delete all contacts of this type
      await this.contactDAO.deleteByContactType(id, merchantId);

      // Delete contact type
      const deletedContactType = await this.contactTypeDAO.deleteById(id, merchantId);

      return {
        id: deletedContactType._id,
        name: deletedContactType.name,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to delete contact type: ${error.message}`);
    }
  }

  /**
   * Ensure all system fields (sys_name, sys_email) are always included as required fields.
   * sys_name is mandatory for customer identification across invoices and CRM.
   * sys_email is mandatory for CRM messaging functionality.
   * @param {Array} fields - Array of field definitions from request
   * @returns {Array} Fields array with sys_name and sys_email guaranteed
   */
  ensureSystemFields(fields) {
    let result = [...fields];

    // Ensure sys_email is present and required
    const hasEmail = result.some(f => f.id === 'sys_email');
    if (hasEmail) {
      result = result.map(f => f.id === 'sys_email' ? { ...f, required: true } : f);
    } else {
      result = [{ id: 'sys_email', required: true }, ...result];
    }

    // Ensure sys_name is present and required (prepend before sys_email for canonical ordering)
    const hasName = result.some(f => f.id === 'sys_name');
    if (hasName) {
      result = result.map(f => f.id === 'sys_name' ? { ...f, required: true } : f);
    } else {
      result = [{ id: 'sys_name', required: true }, ...result];
    }

    return result;
  }

  /**
   * Validate that all field IDs exist (system or custom)
   * @param {Array} fields - Array of field definitions
   * @param {string} merchantId - Merchant ID
   * @throws {ControllerError} If validation fails
   */
  async validateFields(fields, merchantId) {
    for (const field of fields) {
      const { id } = field;

      // Check if system field
      if (isSystemField(id)) {
        const systemField = getSystemFieldById(id);
        if (!systemField) {
          throw new ControllerError(`System field with ID '${id}' not found`, 400);
        }
        continue;
      }

      // Check if custom field exists by _id
      const customField = await this.fieldDefinitionDAO.findById(id, merchantId);
      if (!customField) {
        throw new ControllerError(`Custom field with ID '${id}' does not exist. Please create it first or use a valid field ID.`, 400);
      }
    }
  }
}

export default ContactTypeController;
