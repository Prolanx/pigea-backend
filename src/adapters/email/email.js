import nodemailer from 'nodemailer';

/**
 * Email Adapter - Wraps nodemailer implementation
 * Can be swapped with another email service if needed
 */

/**
 * Create email transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
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
export const sendEmail = async ({ to, subject, text, html, replyTo, fromName }) => {
  const transporter = createTransporter();
  
  // Use custom display name if provided, otherwise use default
  const fromAddress = fromName 
    ? `"${fromName}" <${process.env.EMAIL_USER || 'noreply@bizflow.com'}>`
    : process.env.EMAIL_FROM || '"BizFlow" <noreply@bizflow.com>';
  
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
  
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} (subject: ${subject})`);
    return result;
  } catch (error) {
    console.error('❌ Email transport error:', error.message);
    console.error('SMTP config', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      secure: process.env.EMAIL_SECURE
    });
    console.error('Mail options', { to, subject });

    // Retry once for transient failures
    try {
      console.log('🔁 Retrying email send once...');
      const retryResult = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent on retry to ${to} (subject: ${subject})`);
      return retryResult;
    } catch (retryError) {
      console.error('❌ Retry email send failed:', retryError.message);
      throw new Error(`Failed to send email: ${error.message}. Retry failed: ${retryError.message}`);
    }
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

