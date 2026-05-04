/**
 * Marketing module configuration (module-local)
 * Reads values from environment variables; do NOT hardcode values here.
 */

export const MarketingConfig = {
  WAITLIST_LIST_ID: process.env.BREVO_WAITLIST_LIST_ID ? Number(process.env.BREVO_WAITLIST_LIST_ID) : undefined,
  ENQUIRY_LIST_ID: process.env.BREVO_ENQUIRY_LIST_ID ? Number(process.env.BREVO_ENQUIRY_LIST_ID) : undefined,

  SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  SENDER_NAME: process.env.BREVO_SENDER_NAME,
  SUPPORT_EMAIL: process.env.BREVO_SUPPORT_EMAIL || process.env.BREVO_SENDER_EMAIL
};
