import { ControllerError, DAOError } from '@common/errors.js';
import { getSystemStatusById } from '@modules/crm/constants/system-statuses.js';

/**
 * Message Controller - Business logic for messages
 * Dependencies injected via constructor
 */
class MessageController {
  constructor(messageDAO, contactDAO, emailAdapter, accountDAO) {
    this.messageDAO = messageDAO;
    this.contactDAO = contactDAO;
    this.emailAdapter = emailAdapter;
    this.accountDAO = accountDAO;
  }

  /**
   * Send an email reply to a contact
   * @param {Object} messageData - Message data
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Object>} Created message
   * @throws {ControllerError|DAOError} If sending fails
   */
  async sendReply(messageData, merchantId) {
    try {
      const { contactId, body } = messageData;

      // Verify contact exists and belongs to merchant
      const contactExists = await this.contactDAO.findByIdWithoutMerchantScope(contactId);
      if (!contactExists) {
        throw new ControllerError('Contact not found', 404);
      }

      const contact = await this.contactDAO.findById(contactId, merchantId);
      if (!contact) {
        throw new ControllerError('You do not have permission to message this contact', 403);
      }

      // Get email from contact data
      const email = contact.data.sys_email;
      if (!email) {
        throw new ControllerError('Contact does not have an email address', 400);
      }

      // Get contact name (canonical sys_name only)
      const contactName = contact.data.sys_name || contact.data.sys_email || 'Customer';

      // Get merchant account info for display name and reply-to
      const merchant = await this.accountDAO.findById(merchantId);
      if (!merchant) {
        throw new ControllerError('Merchant account not found', 404);
      }

      const merchantDisplayName = `${merchant.firstName} ${merchant.lastName}`.trim();

      // Send email to contact
      try {
        await this.emailAdapter.sendEmail({
          to: email,
          subject: `Message from ${merchantDisplayName}`,
          html: `
            <p>Hello ${contactName},</p>
            <p>${body.replace(/\n/g, '<br>')}</p>
            <br>
            <p>---</p>
            <p><small>Sent via BizFlow CRM</small></p>
          `,
          replyTo: merchant.email,
          fromName: merchantDisplayName,
        });
      } catch (emailError) {
        throw new ControllerError(`Failed to send email: ${emailError.message}`, 500);
      }

      // Store outgoing message
      const message = await this.messageDAO.create({
        merchantId,
        contactId,
        direction: 'outgoing',
        channel: 'email',
        body,
        sentAt: new Date(),
      });

      // Update contact status to Contacted if it was New
      if (contact.status === 'sys_new') {
        await this.contactDAO.updateById(contactId, merchantId, { status: 'sys_contacted' });
      }

      return {
        id: message._id,
        contactId: message.contactId,
        direction: message.direction,
        channel: message.channel,
        body: message.body,
        sentAt: message.sentAt,
      };
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to send reply: ${error.message}`);
    }
  }

  /**
   * Get message history for a contact
   * @param {string} contactId - Contact ID
   * @param {string} merchantId - Merchant ID from authenticated user
   * @returns {Promise<Array>} Array of messages
   * @throws {ControllerError|DAOError} If retrieval fails
   */
  async getMessageHistory(contactId, merchantId) {
    try {
      // Verify contact exists and belongs to merchant
      const contactExists = await this.contactDAO.findByIdWithoutMerchantScope(contactId);
      if (!contactExists) {
        throw new ControllerError('Contact not found', 404);
      }

      const contact = await this.contactDAO.findById(contactId, merchantId);
      if (!contact) {
        throw new ControllerError('You do not have permission to view this contact', 403);
      }

      // Get messages
      const messages = await this.messageDAO.findByContact(contactId, merchantId);

      return messages.map((msg) => ({
        id: msg._id,
        direction: msg.direction,
        channel: msg.channel,
        body: msg.body,
        sentAt: msg.sentAt,
      }));
    } catch (error) {
      if (error instanceof DAOError || error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(`Failed to get message history: ${error.message}`);
    }
  }
}

export default MessageController;
