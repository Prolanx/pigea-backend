// MarketingConstants contains only non-environmental constants (messages, keys)
// Environment values must come from the module-local config `src/modules/marketing/config/marketing.config.js` which reads process.env
export const MarketingConstants = {
  MESSAGES: {
    SUBSCRIBE_SUCCESS_MESSAGE: 'Subscribed successfully',
    CONTACT_SUCCESS_MESSAGE: 'Contact message sent successfully',
    CONTACT_EMAIL_SUBJECT: 'New contact form submission'
  }
};
