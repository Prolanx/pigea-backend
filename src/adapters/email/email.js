import dns from 'node:dns/promises';
import nodemailer from 'nodemailer';

/**
 * Email Adapter - Wraps nodemailer implementation
 * Can be swapped with another email service if needed
 */

/**
 * Create email transporter
 * @returns {Object} Nodemailer transporter
 */
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 15000);

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const SMTP_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: parseBoolean(process.env.EMAIL_SECURE, false),
  connectionTimeout: SMTP_TIMEOUT_MS,
  greetingTimeout: SMTP_TIMEOUT_MS,
  socketTimeout: SMTP_TIMEOUT_MS,
  dnsTimeout: SMTP_TIMEOUT_MS,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const createTransporter = () => {
  return nodemailer.createTransport(SMTP_CONFIG);
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {string} options.replyTo - Reply-to email address (optional)
 * @param {string} options.fromName - Display name for sender (optional)
 * @returns {Promise<Object>} Email send result
 */
const parseEmailAddress = (formattedAddress) => {
  if (!formattedAddress || typeof formattedAddress !== 'string') return null;
  const match = formattedAddress.match(/<([^>]+)>/);
  return match ? match[1].trim() : formattedAddress.trim();
};

export const sendEmail = async ({ to, subject, text, html, replyTo, fromName, from }) => {
  const startedAt = Date.now();
  console.log('[emailAdapter] sendEmail ENTRY', { to, subject, replyTo, fromName, from });
  console.log('[emailAdapter] SMTP effective config', {
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    timeouts: {
      connectionTimeout: SMTP_CONFIG.connectionTimeout,
      greetingTimeout: SMTP_CONFIG.greetingTimeout,
      socketTimeout: SMTP_CONFIG.socketTimeout,
      dnsTimeout: SMTP_CONFIG.dnsTimeout,
    },
    authUserSet: Boolean(SMTP_CONFIG.auth.user),
    authPassSet: Boolean(SMTP_CONFIG.auth.pass),
  });

  try {
    const dnsStartedAt = Date.now();
    const resolvedHosts = await dns.lookup(SMTP_CONFIG.host, { all: true });
    console.log('[emailAdapter] DNS lookup success', {
      host: SMTP_CONFIG.host,
      addresses: resolvedHosts,
      durationMs: Date.now() - dnsStartedAt,
    });
  } catch (error) {
    console.error('[emailAdapter] DNS lookup failed', {
      host: SMTP_CONFIG.host,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
  }

  const transporter = createTransporter();

  let fromAddress = from || null;

  if (!fromAddress && fromName) {
    const envFromAddress = parseEmailAddress(process.env.EMAIL_FROM) || process.env.EMAIL_USER;
    if (envFromAddress) {
      fromAddress = `"${fromName}" <${envFromAddress}>`;
    }
  }

  if (!fromAddress) {
    fromAddress = process.env.EMAIL_FROM || '"BizFlow" <noreply@bizflow.com>';
  }

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    text,
    html,
  };

  // Add reply-to if provided
  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  // Log transporter config and mail options before sending
  console.log('[emailAdapter] Transporter config', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    from: process.env.EMAIL_FROM,
    secure: process.env.EMAIL_SECURE,
    effectiveTimeoutMs: SMTP_TIMEOUT_MS,
  });
  console.log('[emailAdapter] Mail options', mailOptions);

  try {
    const verifyStartedAt = Date.now();
    await transporter.verify();
    console.log('[emailAdapter] Transport verify success', {
      durationMs: Date.now() - verifyStartedAt,
    });
  } catch (error) {
    console.error('[emailAdapter] Transport verify failed', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
  }

  try {
    const sendStartedAt = Date.now();
    const result = await transporter.sendMail(mailOptions);
    console.log(`[emailAdapter] SUCCESS: Email sent to ${to} (subject: ${subject})`, {
      durationMs: Date.now() - sendStartedAt,
      result,
      totalDurationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    console.error('[emailAdapter] ERROR: Email transport error', { message: error.message, code: error.code, stack: error.stack });
    console.error('[emailAdapter] SMTP config', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      secure: process.env.EMAIL_SECURE
    });
    console.error('[emailAdapter] Mail options', { to, subject });

    const transportError = new Error(`Failed to send email: ${error.message}`);
    transportError.name = 'EmailTransportError';
    transportError.code = error?.code || 'EMAIL_TRANSPORT_ERROR';
    transportError.statusCode = error?.code === 'ETIMEDOUT' || error?.code === 'ESOCKET'
      ? 504
      : 502;
    transportError.retryable = true;
    transportError.isTimeout = error?.code === 'ETIMEDOUT' || error?.message?.toLowerCase().includes('timeout');
    transportError.smtpHost = SMTP_CONFIG.host;
    transportError.smtpPort = SMTP_CONFIG.port;
    throw transportError;
  }
};

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} verificationToken - Verification token/code
 * @returns {Promise<Object>} Email send result
 */
export const sendVerificationEmail = async (email, verificationToken) => {
  const subject = 'Verify Your Email - BizFlow';
  const text = `Your verification code is: ${verificationToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to BizFlow!</h2>
      <p>Please verify your email address using the code below:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
        ${verificationToken}
      </div>
      <p>This code will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;
  
  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset code (5-digit)
 * @returns {Promise<Object>} Email send result
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const subject = 'Reset Your Password - BizFlow';
  const text = `Your password reset code is: ${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password for your BizFlow account.</p>
      <p>Use the code below to reset your password:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
        ${resetToken}
      </div>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        This code will expire in 1 hour.
      </p>
      <p style="color: #666; font-size: 14px;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
  `;
  
  return await sendEmail({ to: email, subject, text, html });
};

