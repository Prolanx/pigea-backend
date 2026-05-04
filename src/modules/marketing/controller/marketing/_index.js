import { MarketingConstants } from '@modules/marketing/constants/marketing.constants.js';
import { MarketingConfig } from '@modules/marketing/constants/marketing.config.js';
import { templates } from '@modules/marketing/utils/template/_index.js';

class MarketingController {
  constructor(brevoAdapter) {
    this.brevoAdapter = brevoAdapter;
  }

  async subscribe({ name, email }) {
    if (!email) throw Object.assign(new Error('Email is required'), { statusCode: 400 });

    // Use the configured waitlist list id (required)
    const listId = MarketingConfig.WAITLIST_LIST_ID;
    if (!listId) throw Object.assign(new Error('BREVO_WAITLIST_LIST_ID is not configured'), { statusCode: 500 });
    const listIds = [listId];

    // include name in attributes if provided
    const attributes = {};
    if (name) attributes.NAME = name;

    const res = await this.brevoAdapter.createOrUpdateContact({ email, listIds, attributes, updateEnabled: true });
    return { message: MarketingConstants.MESSAGES.SUBSCRIBE_SUCCESS_MESSAGE, data: res };
  }

  async sendContactMessage({ firstName, lastName, email, phone, userType, message, termsAccepted }) {
    if (!email || !message) throw Object.assign(new Error('Email and message are required'), { statusCode: 400 });

    const sender = {
      email: MarketingConfig.SENDER_EMAIL,
      name: MarketingConfig.SENDER_NAME
    };

    const recipient = MarketingConfig.SUPPORT_EMAIL || sender.email;

    const subject = `${MarketingConstants.MESSAGES.CONTACT_EMAIL_SUBJECT} - ${firstName || ''} ${lastName || ''}`.trim();
   
   
    const templatePayload = {firstName, lastName, email, phone, userType, message, termsAccepted};
    const htmlContent = templates.generateContactEmailTemplate(templatePayload);
    const textContent = templates.generateContactEmailText(templatePayload);

    // Create or update contact in Brevo and place it in the enquiry list (required)
    const enquiryListId = MarketingConfig.ENQUIRY_LIST_ID;
    if (!enquiryListId) throw Object.assign(new Error('BREVO_ENQUIRY_LIST_ID is not configured'), { statusCode: 500 });

    try {
      const attributes = {};
      if (firstName) attributes.FIRSTNAME = firstName;
      if (lastName) attributes.LASTNAME = lastName;
      if (phone) attributes.SMS = phone;
      if (userType) attributes.USER_TYPE = userType;
    
      await this.brevoAdapter.createOrUpdateContact({ email, listIds: [enquiryListId], attributes, updateEnabled: true });
    } catch (err) {
      // Log and continue: even though the list is required, we don't want to block sending the transactional email if contact creation fails
      console.error('Failed to create/update contact in Brevo for enquiry:', err.message || err);
    }

    const res = await this.brevoAdapter.sendTransactionalEmail({
      sender,
      to: [recipient],
      subject,
      htmlContent,
      textContent
    });

    return { message: MarketingConstants.MESSAGES.CONTACT_SUCCESS_MESSAGE, data: res };
  }
}

export default MarketingController;
