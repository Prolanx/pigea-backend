import { ControllerError, DAOError } from '@common/errors.js';
import { isSystemField, getSystemFieldById } from '@modules/crm/constants/system-fields.js';
import { isSystemStatusId, getDefaultStatusId } from '@modules/crm/constants/system-statuses.js';
import { buildCustomFieldMap } from '@modules/crm/utils/contact-type-response.util.js';
import { buildCustomerResponseFromContact } from '@modules/crm/utils/contact-transform.util.js';

/**
 * Map a populated contactTypeId document to a client-safe shape.
 * Ensures Mongoose's _id is exposed as `id` and never leaked directly.
 * @param {Object|null} populated - Populated ContactType document
 * @returns {Object|null}
 */
function mapContactType(populated) {
  if (!populated || !populated._id) return null;
  return {
    id: populated._id.toString(),
    name: populated.name || null,
    description: populated.description || null,
    fields: populated.fields || [],
  };
}

/**
 * Contact Controller - Business logic for contacts
 * Dependencies injected via constructor
 */
class ContactController {
  /**
   * Build the canonical contact API response shape.
   * Every action that returns a contact must call this to guarantee a consistent shape.
   * @param {Object} contact         Populated Contact document
   * @param {Object} statusData      Resolved rich status object from resolveStatus()
   * @param {Object} customer        Result of buildCustomerResponseFromContact()
   * @returns {Object}
   */
  formatContactResponse(contact, statusData, customer) {
    return {
      id: contact._id,
      contactType: mapContactType(contact.contactTypeId),
      data: customer.data,
      status: statusData,
      source: contact.source,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  constructor(contactDAO, contactTypeDAO, fieldDefinitionDAO, messageDAO, statusDAO) {
    this.contactDAO = contactDAO;
    this.contactTypeDAO = contactTypeDAO;
    this.fieldDefinitionDAO = fieldDefinitionDAO;
    this.messageDAO = messageDAO;
    this.statusDAO = statusDAO;
  }

  /**
   * Create a contact
   * @param {Object} contactData - Contact data
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Created contact
   * @throws {ControllerError|DAOError} If creation fails
   */
  async createContact(contactData, merchantId) {
    try {
      const { contactTypeId, data } = contactData;

      // Verify contact type exists and belongs to merchant
      const contactType = await this.contactTypeDAO.findById(contactTypeId, merchantId);
      if (!contactType) {
        throw new ControllerError('Contact type not found', 404);
      }

      // Validate contact data against contact type schema
      await this.validateContactData(data, contactType, merchantId);

        // Use default system status
      const defaultStatus = getDefaultStatusId();

      // Create contact
      const contact = await this.contactDAO.create({
        merchantId,
        contactTypeId,
        data,
        source: 'Manual',
        status: defaultStatus,
      });

      // Track per-group count
      await this.contactTypeDAO.incrementContactCount(contactTypeId, merchantId, 1);

      // build custom field map for response enrichment
      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);
      const customer = buildCustomerResponseFromContact(contact, customFieldMap);
      const statusData = await this.resolveStatus(contact.status, merchantId);

      return this.formatContactResponse(contact, statusData, customer);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to create contact: ${error.message}`);
    }
  }

  /**
   * Get all contacts for merchant
   * @param {string} merchantId - Merchant ID from authenticated user
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Array>} Array of contacts
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getContacts(merchantId, queryParams = {}) {
    try {
      const contacts = await this.contactDAO.findByMerchant(merchantId, queryParams);

      // Prepare custom field map once for all contacts
      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      // Populate status and enriched data for each contact
      const contactsWithStatus = await Promise.all(
        contacts.map(async (contact) => {
          const statusData = await this.resolveStatus(contact.status, merchantId);
          const customer = buildCustomerResponseFromContact(contact, customFieldMap);
          return this.formatContactResponse(contact, statusData, customer);
        })
      );

      return contactsWithStatus;
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get contacts: ${error.message}`);
    }
  }

  async getContactSummary(merchantId) {
    try {
      const [summary, groupCount] = await Promise.all([
        this.contactDAO.getContactSummary(merchantId),
        this.contactTypeDAO.countByMerchant(merchantId),
      ]);

      return {
        totalCount: summary.totalCount ?? 0,
        newLast30Days: summary.newLast30Days ?? 0,
        groupCount: groupCount ?? 0,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get contact summary: ${error.message}`);
    }
  }

  /**
   * Get contact by ID with message history
   * @param {string} id - Contact ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Contact with messages
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getContactById(id, merchantId) {
    try {
      const contactExists = await this.contactDAO.findByIdWithoutMerchantScope(id);
      if (!contactExists) {
        throw new ControllerError('Contact not found', 404);
      }

      const contact = await this.contactDAO.findById(id, merchantId);
      if (!contact) {
        throw new ControllerError('You do not have permission to access this contact', 403);
      }

      // Get message history
      const messages = await this.messageDAO.findByContact(id, merchantId);

      // Populate status
      const statusData = await this.resolveStatus(contact.status, merchantId);

      // build custom field map to enrich response
      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      const customer = buildCustomerResponseFromContact(contact, customFieldMap);
      const base = this.formatContactResponse(contact, statusData, customer);

      return {
        ...base,
        messages: messages.map((msg) => ({
          id: msg._id,
          direction: msg.direction,
          channel: msg.channel,
          body: msg.body,
          sentAt: msg.sentAt,
        })),
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get contact: ${error.message}`);
    }
  }

  /**
   * Update contact
   * @param {string} id - Contact ID
   * @param {Object} updateData - Data to update (supports partial updates)
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Updated contact
   * @throws {ControllerError|DAOError} If update fails
   */
  async updateContact(id, updateData, merchantId) {
    try {
      const contactExists = await this.contactDAO.findByIdWithoutMerchantScope(id);
      if (!contactExists) {
        throw new ControllerError('Contact not found', 404);
      }

      const existingContact = await this.contactDAO.findById(id, merchantId);
      if (!existingContact) {
        throw new ControllerError('You do not have permission to update this contact', 403);
      }

      // Resolve the existing contact type ID as a plain string for comparison
      const oldContactTypeId = String(
        existingContact.contactTypeId?._id || existingContact.contactTypeId
      );

      // If the caller is attempting to change the contact type, handle counter transfer
      const newContactTypeId = updateData.contactTypeId
        ? String(updateData.contactTypeId)
        : null;

      if (newContactTypeId && newContactTypeId !== oldContactTypeId) {
        // Validate the new contact type belongs to this merchant
        const newContactType = await this.contactTypeDAO.findById(newContactTypeId, merchantId);
        if (!newContactType) {
          throw new ControllerError('New contact type not found', 404);
        }
        // Transfer group counts: old group -1, new group +1 (Stats net is 0)
        await this.contactTypeDAO.incrementContactCount(oldContactTypeId, merchantId, -1);
        await this.contactTypeDAO.incrementContactCount(newContactTypeId, merchantId, 1);
      }

      // If updating data fields, merge with existing data and validate
      if (updateData.data) {
        // Merge new data with existing data (partial update)
        const mergedData = { ...existingContact.data, ...updateData.data };

        const resolvedContactTypeId = newContactTypeId || oldContactTypeId;
        const contactType = await this.contactTypeDAO.findById(resolvedContactTypeId, merchantId);

        // Validate merged data against contact type
        await this.validateContactData(mergedData, contactType, merchantId);

        // Replace updateData.data with merged data
        updateData.data = mergedData;
      }

      // Validate status if being updated
      if (updateData.status) {
        await this.validateStatus(updateData.status, merchantId);
      }

      const contact = await this.contactDAO.updateById(id, merchantId, updateData);

      // Populate status
      const statusData = await this.resolveStatus(contact.status, merchantId);

      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      const customer = buildCustomerResponseFromContact(contact, customFieldMap);

      return this.formatContactResponse(contact, statusData, customer);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to update contact: ${error.message}`);
    }
  }

  /**
   * Delete contact
   * @param {string} id - Contact ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Deleted contact
   * @throws {ControllerError|DAOError} If deletion fails
   */
  async deleteContact(id, merchantId) {
    try {
      const contactExists = await this.contactDAO.findByIdWithoutMerchantScope(id);
      if (!contactExists) {
        throw new ControllerError('Contact not found', 404);
      }

      const contact = await this.contactDAO.findById(id, merchantId);
      if (!contact) {
        throw new ControllerError('You do not have permission to delete this contact', 403);
      }

      // Delete associated messages
      await this.messageDAO.deleteByContact(id, merchantId);

      // Delete contact
      const deletedContact = await this.contactDAO.deleteById(id, merchantId);

      // Decrement per-group count and overall contact count
      if (deletedContact?.contactTypeId) {
        const contactTypeId = deletedContact.contactTypeId._id
          ? deletedContact.contactTypeId._id
          : deletedContact.contactTypeId;
        await this.contactTypeDAO.incrementContactCount(contactTypeId, merchantId, -1);
      }

      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      const customer = buildCustomerResponseFromContact(deletedContact, customFieldMap);
      return {
        id: deletedContact._id,
        data: customer.data,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to delete contact: ${error.message}`);
    }
  }

  /**
   * Submit contact form (public endpoint)
   * @param {Object} submissionData - Form submission data
   * @param {string} merchantId - Merchant ID
   * @param {string} contactTypeId - Contact type ID assigned to form
   * @returns {Promise<Object>} Created/updated contact
   * @throws {ControllerError|DAOError} If submission fails
   */
  async submitContactForm(submissionData, merchantId, contactTypeId) {
    try {
      // Verify contact type exists
      const contactType = await this.contactTypeDAO.findById(contactTypeId, merchantId);
      if (!contactType) {
        throw new ControllerError('Contact type not found', 404);
      }

      // Validate submission data
      await this.validateContactData(submissionData, contactType, merchantId);

      // Extract email to check for existing contact
      const email = submissionData.sys_email;
      let contact = null;

      if (email) {
        contact = await this.contactDAO.findByEmail(merchantId, contactTypeId, email);
      }

      // Use default system status for new contacts
      const defaultStatus = getDefaultStatusId();

      if (!contact) {
        // Create new contact
        contact = await this.contactDAO.create({
          merchantId,
          contactTypeId,
          data: submissionData,
          source: 'WebsiteForm',
          status: defaultStatus,
        });

        // Track per-group count
        await this.contactTypeDAO.incrementContactCount(contactTypeId, merchantId, 1);
      }

      // Extract message if provided
      const messageBody = submissionData.sys_message || submissionData.message;
      if (messageBody) {
        await this.messageDAO.create({
          merchantId,
          contactId: contact._id,
          direction: 'incoming',
          channel: 'email',
          body: messageBody,
          sentAt: new Date(),
        });
      }

      const customFields = await this.fieldDefinitionDAO.findByMerchant(merchantId);
      const customFieldMap = buildCustomFieldMap(customFields);

      const customer = buildCustomerResponseFromContact(contact, customFieldMap);
      const statusData = await this.resolveStatus(contact.status, merchantId);

      return this.formatContactResponse(contact, statusData, customer);
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to submit contact form: ${error.message}`);
    }
  }

  /**
   * Resolve status to full status object (system or custom)
   * @param {string} statusId - Status ID
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<Object>} Status object with name, description, color
   */
  async resolveStatus(statusId, merchantId) {
    // Check if it's a system status
    const { getSystemStatusById } = await import('@modules/crm/constants/system-statuses.js');
    const systemStatus = getSystemStatusById(statusId);
    if (systemStatus) {
      return systemStatus;
    }

    // Check if it's a custom status
    const customStatus = await this.statusDAO.findById(statusId, merchantId);
    if (customStatus) {
      return {
        id: customStatus._id.toString(),
        name: customStatus.name,
        description: customStatus.description,
        color: customStatus.color,
        isDefault: false,
      };
    }

    // Fallback if status not found
    return {
      id: statusId,
      name: 'Unknown',
      description: 'Status not found',
      color: '#6B7280',
      isDefault: false,
    };
  }

  /**
   * Validate contact data against contact type schema
   * @param {Object} data - Contact data
   * @param {Object} contactType - Contact type definition
   * @param {string} merchantId - Merchant ID
   * @throws {ControllerError} If validation fails
   */
  async validateContactData(data, contactType, merchantId) {
    // Build maps to accept either field IDs (legacy) or field names (new)
    const fieldIdToName = new Map();
    const fieldNameToId = new Map();
    for (const f of contactType.fields) {
      fieldIdToName.set(String(f.id), f.name || f.id);
      fieldNameToId.set(f.name || f.id, String(f.id));
    }

    // Check all required fields are present (accepting id OR name as key)
    for (const fieldDef of contactType.fields) {
      const hasById = Object.prototype.hasOwnProperty.call(data, fieldDef.id);
      const hasByName = Object.prototype.hasOwnProperty.call(data, fieldDef.name || '');
      if (fieldDef.required && !hasById && !hasByName) {
        // Get field name for error message
        let fieldName = fieldDef.id;
        if (isSystemField(fieldDef.id)) {
          const sysField = getSystemFieldById(fieldDef.id);
          fieldName = sysField ? sysField.name : fieldDef.id;
        } else {
          const customField = await this.fieldDefinitionDAO.findById(
            fieldDef.id,
            merchantId
          );
          fieldName = customField ? customField.name : fieldDef.id;
        }
        throw new ControllerError(`${fieldName} is required`, 400);
      }
    }

    // Validate all provided data fields exist in contact type (allow id OR name)
    const allowedKeys = new Set();
    for (const f of contactType.fields) {
      allowedKeys.add(String(f.id));
      if (f.name) allowedKeys.add(f.name);
    }

    for (const key of Object.keys(data)) {
      if (!allowedKeys.has(key)) {
        throw new ControllerError(`Field ${key} is not allowed for this contact type`, 400);
      }
    }
  }

  /**
   * Validate status ID (system or custom)
   * @param {string} statusId - Status ID to validate
   * @param {string} merchantId - Merchant ID
   * @throws {ControllerError} If status doesn't exist
   */
  async validateStatus(statusId, merchantId) {
    // Check if it's a system status
    if (isSystemStatusId(statusId)) {
      return; // Valid system status
    }

    // Check if it's a custom status belonging to this merchant
    const customStatus = await this.statusDAO.findById(statusId, merchantId);
    if (!customStatus) {
      throw new ControllerError('Invalid status ID', 400);
    }
  }
}

export default ContactController;
