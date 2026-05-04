import { ControllerError, DAOError } from '@common/errors.js';
import { getSystemFields, isSystemFieldName, isSystemField } from '@modules/crm/constants/system-fields.js';

function buildFieldUsageMap(contactTypes = []) {
  const map = new Map();

  contactTypes.forEach((ct) => {
    const groupId = ct?._id?.toString?.();
    if (!groupId) return;

    const group = {
      id: groupId,
      name: ct?.name || "",
      contactCount: ct?.contactCount ?? 0,
    };

    const fields = Array.isArray(ct.fields) ? ct.fields : [];
    fields.forEach((fieldRef) => {
      const fieldId = fieldRef?.id ? String(fieldRef.id) : null;
      if (!fieldId) return;

      const list = map.get(fieldId) || [];
      list.push(group);
      map.set(fieldId, list);
    });
  });

  for (const [fieldId, groups] of map) {
    groups.sort((a, b) => (b.contactCount || 0) - (a.contactCount || 0));
    map.set(fieldId, groups);
  }

  return map;
}

/**
 * FieldDefinition Controller - Business logic for field management
 * Dependencies injected via constructor
 */
class FieldDefinitionController {
  constructor(fieldDefinitionDAO, contactTypeDAO) {
    this.fieldDefinitionDAO = fieldDefinitionDAO;
    this.contactTypeDAO = contactTypeDAO;
  }

  /**
   * Get all available fields (system + custom)
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} System and custom fields
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getAllFields(merchantId) {
    try {
      // Get contact types (groups) so we can compute usage info for each field
      const contactTypes = await this.contactTypeDAO.findByMerchant(merchantId);
      const usageMap = buildFieldUsageMap(contactTypes);

      // Get system fields (hardcoded) and map to common format
      const systemFields = getSystemFields().map((field) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        isSystem: true,
        usageGroups: usageMap.get(field.id) || [],
      }));

      // Get custom fields from database and map
      const customFields = (await this.fieldDefinitionDAO.findByMerchant(merchantId)).map((field) => ({
        id: field._id.toString(),
        name: field.name,
        type: field.type,
        options: field.options,
        isSystem: false,
        createdAt: field.createdAt,
        usageGroups: usageMap.get(field._id.toString()) || [],
      }));

      // return a single array with system fields first
      return [...systemFields, ...customFields];
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get fields: ${error.message}`);
    }
  }

  /**
   * Get field definition by ID
   * @param {string} id - Field definition ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Field definition
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getFieldById(id, merchantId) {
    try {
      const field = await this.fieldDefinitionDAO.findById(id, merchantId);
      if (!field) {
        throw new ControllerError('Field not found', 404);
      }

      const contactTypes = await this.contactTypeDAO.findByMerchant(merchantId);
      const usageMap = buildFieldUsageMap(contactTypes);
      const usageGroups = usageMap.get(id) || [];

      return {
        id: field._id.toString(),
        name: field.name,
        type: field.type,
        options: field.options,
        isSystem: false,
        createdAt: field.createdAt,
        updatedAt: field.updatedAt,
        usageGroups,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get field: ${error.message}`);
    }
  }

  /**
   * Create a custom field definition
   * @param {Object} fieldData - Field definition data
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Created field definition
   * @throws {ControllerError|DAOError} If creation fails
   */
  async createField(fieldData, merchantId) {
    try {
      const { name, type, options } = fieldData;

      // Validate name doesn't conflict with system field names
      if (isSystemFieldName(name)) {
        throw new ControllerError('Field name conflicts with system field', 400);
      }

      // Validate select type has options
      if (type === 'select' && (!options || options.length === 0)) {
        throw new ControllerError('Select fields must have at least one option', 400);
      }

      // Create field
      const field = await this.fieldDefinitionDAO.create({
        merchantId,
        name,
        type,
        options: type === 'select' ? options : [],
      });

      return {
        id: field._id.toString(),
        name: field.name,
        type: field.type,
        options: field.options,
        isSystem: false,
        createdAt: field.createdAt,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to create field: ${error.message}`);
    }
  }

  /**
   * Update a custom field definition
   * @param {string} id - Field definition ID
   * @param {Object} updateData - Data to update
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Updated field definition
   * @throws {ControllerError|DAOError} If update fails
   */
  async updateField(id, updateData, merchantId) {
    try {
      const existingField = await this.fieldDefinitionDAO.findById(id, merchantId);
      if (!existingField) {
        throw new ControllerError('Field not found', 404);
      }

      // Validate select type has options if updating
      if (updateData.type === 'select' && (!updateData.options || updateData.options.length === 0)) {
        throw new ControllerError('Select fields must have at least one option', 400);
      }

      const field = await this.fieldDefinitionDAO.updateById(id, merchantId, updateData);

      return {
        id: field._id.toString(),
        name: field.name,
        type: field.type,
        options: field.options,
        isSystem: false,
        createdAt: field.createdAt,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to update field: ${error.message}`);
    }
  }

  /**
   * Delete a custom field definition
   * @param {string} id - Field definition ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Deleted field definition
   * @throws {ControllerError|DAOError} If deletion fails
   */
  async deleteField(id, merchantId) {
    try {
      // guard against deleting built-in system fields first
      if (isSystemField(id)) {
        throw new ControllerError('Cannot delete system field', 400);
      }

      const field = await this.fieldDefinitionDAO.findById(id, merchantId);
      if (!field) {
        throw new ControllerError('Field not found', 404);
      }

      const deletedField = await this.fieldDefinitionDAO.deleteById(id, merchantId);

      // update metrics: decrement custom field count
      if (this.statController) {
        await this.statController.changeCustomFields(merchantId, -1);
      }

      return {
        id: deletedField._id.toString(),
        name: deletedField.name,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to delete field: ${error.message}`);
    }
  }

  /**
   * Get field summary counts for the field query page
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Summary counts
   */
  async getFieldSummary(merchantId) {
    try {
      const systemFields = getSystemFields();
      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const systemCount = systemFields.length;
      const customCount = customFields.length;
      return {
        totalCount: systemCount + customCount,
        systemCount,
        customCount,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get field summary: ${error.message}`);
    }
  }
}

export default FieldDefinitionController;
