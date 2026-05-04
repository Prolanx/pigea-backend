/**
 * Environment Variables Constants
 * All environment variables are read here and exported with the same names
 */

// Server Configuration
export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;

// Database Configuration
export const MONGODB_URI = process.env.MONGODB_URI
// JWT Configuration
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN

// Verification Token Configuration
export const VERIFICATION_TOKEN_EXPIRES_IN = process.env.VERIFICATION_TOKEN_EXPIRES_IN || '24h';

// Password Reset Token Configuration
export const PASSWORD_RESET_TOKEN_EXPIRES_IN = process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || '5m';

// Email Configuration
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT || 587;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const EMAIL_FROM = process.env.EMAIL_FROM;

// ###### SOCIAL MEDIA MANAGEMTN API CONFIG
export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET
export const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI

export const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID
export const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET
export const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI

export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID
export const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET
export const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI


// Brevo (Sendinblue) Configuration
export const BREVO_API_KEY = process.env.BREVO_API_KEY;
export const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
export const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
export const BREVO_WAITLIST_LIST_ID = process.env.BREVO_WAITLIST_LIST_ID;
export const BREVO_ENQUIRY_LIST_ID = process.env.BREVO_ENQUIRY_LIST_ID;

// Platform Branding
export const PLATFORM_NAME = process.env.PLATFORM_NAME 
export const PLATFORM_LOGO_URL = process.env.PLATFORM_LOGO_URL;
export const PLATFORM_SUPPORT_EMAIL = process.env.PLATFORM_SUPPORT_EMAIL;
