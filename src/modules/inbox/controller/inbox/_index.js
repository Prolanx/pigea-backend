import { ingestInboundEmailWebhook } from '@modules/inbox/controller/inbox/ingestInboundEmailWebhook.js';
import { listMessages } from '@modules/inbox/controller/inbox/listMessages.js';
import { getMessageSummary } from '@modules/inbox/controller/inbox/getMessageSummary.js';
import { getMessageById } from '@modules/inbox/controller/inbox/getMessageById.js';
import { updateMessageStatus } from '@modules/inbox/controller/inbox/updateMessageStatus.js';
import { replyToMessage } from '@modules/inbox/controller/inbox/replyToMessage.js';
import { listConversations } from '@modules/inbox/controller/inbox/listConversations.js';
import { getConversationThread } from '@modules/inbox/controller/inbox/getConversationThread.js';
import { resolveConversation } from '@modules/inbox/controller/inbox/resolveConversation.js';
import { listChannels } from '@modules/inbox/controller/inbox/listChannels.js';
import { getChannelSummary } from '@modules/inbox/controller/inbox/getChannelSummary.js';
import { connectChannel } from '@modules/inbox/controller/inbox/connectChannel.js';
import { disconnectChannel } from '@modules/inbox/controller/inbox/disconnectChannel.js';
import { updateChannelConfig } from '@modules/inbox/controller/inbox/updateChannelConfig.js';

/**
 * InboxController â€” business logic layer for the inbox module.
 * Receives all dependencies via constructor (DI pattern).
 */
class InboxController {
/**
   * @param {InboxDAO} inboxDAO
   * @param {AccountDAO} accountDAO - Required to resolve merchant by inbox slug
   * @param {Object} emailAdapter - Outbound email adapter
   * @param {Object} [socketAdapter] - Real-time socket adapter (optional)
   * @param {ContactDAO} [contactDAO] - CRM contact DAO (optional, for email contact auto-creation)
   * @param {ContactTypeDAO} [contactTypeDAO] - CRM contact type DAO (optional, for email contact auto-creation)
   */
  constructor(inboxDAO, accountDAO, emailAdapter, socketAdapter = null, contactDAO = null, contactTypeDAO = null) {
    this.inboxDAO = inboxDAO;
    this.accountDAO = accountDAO;
    this.emailAdapter = emailAdapter;
    this.socketAdapter = socketAdapter;
    this.contactDAO = contactDAO;
    this.contactTypeDAO = contactTypeDAO;
  }

  async ingestInboundEmailWebhook(items, traceContext = {}) {
    return ingestInboundEmailWebhook.call(this, items, traceContext);
  }

  /**
   * Auto-create a CRM contact from an inbound email sender.
    * Uses the system-controlled "General" contact group.
   * Errors are logged but don't fail the inbox ingestion.
   * 
   * @param {Object} merchant - Account document with businessInfo
   * @param {string} senderEmail - Email sender address
   * @param {string} senderName - Email sender display name (optional)
   * @private
   */
  async createContactFromEmail(merchant, senderEmail, senderName = null) {
    try {
      // Skip if CRM DAOs are not available
      if (!this.contactDAO || !this.contactTypeDAO) {
        return;
      }

      // Skip if email is invalid
      if (!senderEmail || typeof senderEmail !== 'string') {
        return;
      }

      const normalizedEmail = senderEmail.toLowerCase();

      // Use the system-owned General group only.
      const generalGroup = await this.contactTypeDAO.findSystemGeneralGroup(merchant._id);
      if (!generalGroup) {
        return;
      }

      const contactTypeId = generalGroup._id;

      // Skip if this sender already exists in the General group.
      const existingContact = await this.contactDAO.findByEmail(
        merchant._id,
        contactTypeId,
        normalizedEmail,
      );
      if (existingContact) {
        return;
      }

      // Get the contact type to check required fields
      const contactType = await this.contactTypeDAO.findById(contactTypeId, merchant._id);
      if (!contactType) {
        return;
      }

      // Build minimal contact data with email and name
      // Try to map to system fields first (email, name, etc.)
      const contactData = {};
      
      // Look for email field in contact type
      let emailFieldId = null;
      let nameFieldId = null;
      for (const field of contactType.fields) {
        if (field.id === 'sys_email') emailFieldId = field.id;
        if (field.id === 'sys_name') nameFieldId = field.id;
      }

      // Populate available fields
      if (emailFieldId) {
        contactData[emailFieldId] = normalizedEmail;
      }
      if (nameFieldId && senderName) {
        contactData[nameFieldId] = senderName;
      }

      // If no email field is available, use a fallback generic field
      if (!emailFieldId && contactType.fields.length > 0) {
        const firstField = contactType.fields[0];
        contactData[firstField.id] = normalizedEmail;
      }

      // Create the contact with default status
      const { getDefaultStatusId } = await import('@modules/crm/constants/system-statuses.js');
      const defaultStatus = getDefaultStatusId();

      await this.contactDAO.create({
        merchantId: merchant._id,
        contactTypeId,
        data: contactData,
        source: 'Manual',
        status: defaultStatus,
      });

      // Increment contact count for the contact type
      await this.contactTypeDAO.incrementContactCount(contactTypeId, merchant._id, 1);
    } catch (error) {
      // Log error but don't fail the inbox ingestion
      const isInboxDebugEnabled = process.env.NODE_ENV !== 'production';
      if (isInboxDebugEnabled) {
        console.error(
          `[InboxController] Failed to auto-create contact from email ${senderEmail}:`,
          error.message
        );
      }
    }
  }

  async listMessages(merchantId, queryParams) {
    return listMessages.call(this, merchantId, queryParams);
  }

  async getMessageSummary(merchantId) {
    return getMessageSummary.call(this, merchantId);
  }

  async getMessageById(messageId, merchantId) {
    return getMessageById.call(this, messageId, merchantId);
  }

  async updateMessageStatus(messageId, merchantId, status) {
    return updateMessageStatus.call(this, messageId, merchantId, status);
  }

  async replyToMessage(messageId, merchantId, payload) {
    return replyToMessage.call(this, messageId, merchantId, payload);
  }

  async listConversations(merchantId, queryParams) {
    return listConversations.call(this, merchantId, queryParams);
  }

  async getConversationThread(conversationId, merchantId) {
    return getConversationThread.call(this, conversationId, merchantId);
  }

  async resolveConversation(conversationId, merchantId) {
    return resolveConversation.call(this, conversationId, merchantId);
  }

  async listChannels(merchantId) {
    return listChannels.call(this, merchantId);
  }

  async getChannelSummary(merchantId) {
    return getChannelSummary.call(this, merchantId);
  }

  async connectChannel(merchantId, channelType, payload) {
    return connectChannel.call(this, merchantId, channelType, payload);
  }

  async disconnectChannel(merchantId, channelType) {
    return disconnectChannel.call(this, merchantId, channelType);
  }

  async updateChannelConfig(merchantId, channelType, payload) {
    return updateChannelConfig.call(this, merchantId, channelType, payload);
  }
}

export default InboxController;
